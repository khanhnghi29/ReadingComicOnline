using Core.Entities;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Specialized;
using Microsoft.IdentityModel.JsonWebTokens;
using Core.Dtos;


namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly VNPayService _vnPayService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IUnitOfWork unitOfWork, VNPayService vnPayService, ILogger<PaymentController> logger)
        {
            _unitOfWork = unitOfWork;
            _vnPayService = vnPayService;
            _logger = logger;
        }

        [HttpPost("book/{comicId}")]
        [Authorize(Roles = "Reader")]
        public async Task<ActionResult<string>> PurchaseBook([FromBody] CreateBookPaymentRequest request)
        {
            try
            {
                var comic = await _unitOfWork.Comics.GetByIdAsync(request.ComicId);
                if (comic == null)
                {
                    return NotFound("Comic not found.");
                }


                var userName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"Ten cua user da mua: {userName}");
                if (string.IsNullOrEmpty(userName))
                {
                    return Unauthorized("User not authenticated.");
                }

                // Kiểm tra user đã mua comic chưa
                var hasPurchased = await _unitOfWork.BookPurchases.GetPurchasedComicsAsync(userName);
                var isPurchased = hasPurchased.Any(p => p.ComicId == request.ComicId && p.PaymentStatusId == 2);
                if (isPurchased)
                {
                    return BadRequest("You have already purchased this comic.");
                }


                var bookPurchase = new BookPurchaseDto
                {
                    UserName = userName,
                    ComicId = request.ComicId,
                    PaymentMethodId = 1, // VNPay
                    PaymentStatusId = 1, // Pending
                    PaymentDate = DateTime.Now,
                    TransactionId = Guid.NewGuid().ToString(),
                    Amount = comic.Price
                };

                // Lưu và nhận về PurchaseId từ DB
                var purchaseId = await _unitOfWork.BookPurchases.AddAsync(bookPurchase);
                await _unitOfWork.CompleteAsync();

                Console.WriteLine($"Created BookPurchase with ID: {purchaseId}");

                // Tạo VNPay payment URL
                var vnPayModel = new VNPayRequestModel
                {
                    OrderId = purchaseId.ToString(),
                    Amount = bookPurchase.Amount,
                    CreatedDate = DateTime.Now,
                    OrderType = "billpayment",
                    ExpireDate = DateTime.Now.AddMinutes(15)
                };

                var paymentUrl = _vnPayService.CreatePaymentUrl(HttpContext, vnPayModel);

                return Ok(new
                {
                    purchaseId = purchaseId,
                    paymentUrl = paymentUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing book purchase.");
                return StatusCode(500, "An error occurred while processing your request.");

            }
        }
        [HttpPost("subscription/{subscriptionId}")]
        [Authorize(Roles = "Reader")]
        public async Task<ActionResult<string>> PurchaseSubscription([FromBody] CreateSubscriptionPaymentRequest request)
        {
            try
            {
                var subscription = await _unitOfWork.Subscriptions.GetByIdAsync(request.SubscriptionId);
                if (subscription == null)
                {
                    return NotFound("Subscription not found.");
                }
                var userName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userName))
                { 
                    return Unauthorized("User not authenticated.");
                }
                var subscriptionPurchase = new SubscriptionPurchaseDto
                {
                    UserName = userName,
                    SubscriptionId = request.SubscriptionId,
                    PaymentMethodId = 1,
                    PaymentStatusId = 1,
                    PaymentDate = DateTime.Now,
                    ExpiryDate = DateTime.Now.AddDays(subscription.Duration),
                    TransactionId = Guid.NewGuid().ToString(),
                    Amount = subscription.Price
                };

                // Lưu và nhận về PurchaseId
                var purchaseId = await _unitOfWork.SubscriptionPurchases.AddAsync(subscriptionPurchase);
                await _unitOfWork.CompleteAsync();

                Console.WriteLine($"Created SubscriptionPurchase with ID: {purchaseId}");

                // Tạo VNPay payment URL
                var vnPayModel = new VNPayRequestModel
                {
                    OrderId = $"SUB{purchaseId}",
                    Amount = subscriptionPurchase.Amount,
                    CreatedDate = DateTime.Now,
                    OrderType = "billpayment",
                    ExpireDate = DateTime.Now.AddMinutes(15)
                };

                var paymentUrl = _vnPayService.CreatePaymentUrl(HttpContext, vnPayModel);

                return Ok(new
                {
                    purchaseId = purchaseId,
                    paymentUrl = paymentUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription payment");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("vnpay-callback")]
        public async Task<ActionResult> VNPayCallback()
        {
            try
            {
                var response = _vnPayService.ProcessVNPayCallback(Request.Query);

                _logger.LogInformation($"VNPay callback - OrderId: {response.OrderId}, Success: {response.Success}");

                if (!response.IsValidSignature)
                {
                    _logger.LogWarning("Invalid VNPay signature");
                    return BadRequest(new { message = "Invalid signature" });
                }
                
                if (response.OrderId.StartsWith("SUB")) // Thành công
                {
                    var purchaseId = int.Parse(response.OrderId.Substring(3));
                    var purchase = await _unitOfWork.SubscriptionPurchases.GetByIdAsync(purchaseId);
                    if (purchase == null)
                    {
                        return NotFound(new { message = "Subscription purchase not found" });
                    }
                    if (response.Success)
                    {
                        purchase.PaymentStatusId = 2; // Completed
                        purchase.TransactionId = response.TransactionId;
                        purchase.PaymentDate = response.PaymentDate;                       
                    }
                    else
                    {
                        purchase.PaymentStatusId = 3; // Failed
                    }
                    await _unitOfWork.SubscriptionPurchases.UpdateAsync(purchase);
                    await _unitOfWork.CompleteAsync();
                    // Redirect về frontend với kết quả
                    var redirectUrl = response.Success
                        ? $"http://localhost:3000/payment-success?type=subscription&id={purchaseId}"
                        : $"http://localhost:3000/payment-failed?code={response.ResponseCode}";

                    return Redirect(redirectUrl);
                }
                else
                {
                    // Xử lý Book payment
                    var purchaseId = int.Parse(response.OrderId);
                    var purchase = await _unitOfWork.BookPurchases.GetByIdAsync(purchaseId);

                    if (purchase == null)
                        return NotFound(new { message = "Book purchase not found" });

                    if (response.Success)
                    {
                        purchase.PaymentStatusId = 2; // Completed
                        purchase.TransactionId = response.TransactionId;
                        purchase.PaymentDate = response.PaymentDate;
                    }
                    else
                    {
                        purchase.PaymentStatusId = 3; // Failed
                    }

                    await _unitOfWork.BookPurchases.UpdateAsync(purchase);
                    await _unitOfWork.CompleteAsync();


                    // Redirect về frontend với kết quả
                    var redirectUrl = response.Success
                        ? $"http://localhost:3000/payment-success?type=book&id={purchaseId}"
                        : $"http://localhost:3000/payment-failed?code={response.ResponseCode}";

                    return Redirect(redirectUrl);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing VNPay callback.");
                return StatusCode(500, "An error occurred while processing the payment callback.");
            }
        }
    }

}
