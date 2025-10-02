using Core.Entities;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Specialized;
using Microsoft.IdentityModel.JsonWebTokens;


namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly VNPayService _vnpayService;

        public PaymentController(IUnitOfWork unitOfWork, VNPayService vnpayService)
        {
            _unitOfWork = unitOfWork;
            _vnpayService = vnpayService;
        }

        [HttpPost("book/{comicId}")]
        [Authorize(Roles = "Reader")]
        public async Task<ActionResult<string>> PurchaseBook(int comicId)
        {
            var comic = await _unitOfWork.Comics.GetByIdAsync(comicId);
            if (comic == null)
            {
                return NotFound("Comic not found.");
            }
            // Debug: Log tất cả claims
            Console.WriteLine("Claims in token:");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Type: {claim.Type}, Value: {claim.Value}");
            }
            //var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine("UserName: " + userName);
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized("User not authenticated.");
            }

            // Tạo BookPurchase record với PaymentStatus = Pending (1)
            var bookPurchase = new BookPurchase
            {
                UserName = userName,
                ComicId = comicId,
                PaymentMethodId = 2, // VNPay
                PaymentStatusId = 2, // Pending
                PaymentDate = DateTime.Now,
                TransactionId = Guid.NewGuid().ToString(), // OrderId tạm thời
                Amount = comic.Price
            };

            var purchaseId = await _unitOfWork.BookPurchases.AddAsync(bookPurchase);
            await _unitOfWork.CompleteAsync();

            // Tạo payment URL từ VNPay
            var paymentUrl = _vnpayService.CreatePaymentUrl(purchaseId.ToString(), bookPurchase.Amount, userName, $"Thanh toán mua Comic: {comic.Title}");

            return Ok(new { PaymentUrl = paymentUrl });
        }

        [HttpPost("subscription/{subscriptionId}")]
        [Authorize(Roles = "Reader")]
        public async Task<ActionResult<string>> PurchaseSubscription(int subscriptionId)
        {
            // Sửa lỗi: Lấy từ Subscriptions thay vì SubscriptionPurchases
            var subscription = await _unitOfWork.Subscriptions.GetByIdAsync(subscriptionId);
            if (subscription == null)
            {
                return NotFound("Subscription not found.");
            }
            // Debug: Log tất cả claims
            Console.WriteLine("Claims in token:");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Type: {claim.Type}, Value: {claim.Value}");
            }
            //var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            //var userName = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var userName = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine("UserName: " + userName);
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized("User not authenticated.");
            }

            var subscriptionPurchase = new SubscriptionPurchase
            {
                UserName = userName,
                SubscriptionId = subscriptionId,
                PaymentMethodId = 2, // VNPay
                PaymentStatusId = 2, // Pending
                PaymentDate = DateTime.Now,
                ExpireDate = DateTime.Now.AddMonths(subscription.Duration),
                TransactionId = Guid.NewGuid().ToString(),
                Amount = subscription.Price
            };

            var purchaseId = await _unitOfWork.SubscriptionPurchases.AddAsync(subscriptionPurchase);
            await _unitOfWork.CompleteAsync();

            var paymentUrl = _vnpayService.CreatePaymentUrl(purchaseId.ToString(), subscriptionPurchase.Amount, userName, $"Thanh toán Subscription ID {subscriptionId}");

            return Ok(new { PaymentUrl = paymentUrl });
        }

        [HttpGet("vnpay-callback")]
        public async Task<ActionResult> VNPayCallback()
        {
            // Sử dụng Request.Query thay vì Request.Form
            var queryParams = new NameValueCollection();
            foreach (var key in Request.Query.Keys)
            {
                queryParams.Add(key, Request.Query[key].ToString());
            }

            if (!_vnpayService.VerifyPayment(queryParams))
            {
                return BadRequest("Invalid payment signature.");
            }

            var vnpTxnRef = queryParams["vnp_TxnRef"];
            var vnpTransactionNo = queryParams["vnp_TransactionNo"];
            var vnpResponseCode = queryParams["vnp_ResponseCode"];

            if (string.IsNullOrEmpty(vnpResponseCode))
            {
                return BadRequest("Missing response code.");
            }

            var vnpResponseCodeInt = int.Parse(vnpResponseCode);

            if (vnpResponseCodeInt == 0) // Thành công
            {
                // Cập nhật BookPurchase hoặc SubscriptionPurchase
                var purchaseId = int.Parse(vnpTxnRef);
                var bookPurchase = await _unitOfWork.BookPurchases.GetByIdAsync(purchaseId);
                if (bookPurchase != null)
                {
                    bookPurchase.PaymentStatusId = 1; // Success
                    bookPurchase.TransactionId = vnpTransactionNo;
                    await _unitOfWork.BookPurchases.UpdateAsync(bookPurchase);
                }
                else
                {
                    var subscriptionPurchase = await _unitOfWork.SubscriptionPurchases.GetByIdAsync(purchaseId);
                    if (subscriptionPurchase != null)
                    {
                        subscriptionPurchase.PaymentStatusId = 1; // Success
                        subscriptionPurchase.TransactionId = vnpTransactionNo;
                        await _unitOfWork.SubscriptionPurchases.UpdateAsync(subscriptionPurchase);
                    }
                    else
                    {
                        return NotFound("Purchase record not found.");
                    }
                }
                await _unitOfWork.CompleteAsync();
            }
            else
            {
                // Cập nhật thành Failed
                var purchaseId = int.Parse(vnpTxnRef);
                var bookPurchase = await _unitOfWork.BookPurchases.GetByIdAsync(purchaseId);
                if (bookPurchase != null)
                {
                    bookPurchase.PaymentStatusId = 3; // Failed
                    bookPurchase.TransactionId = vnpTransactionNo;
                    await _unitOfWork.BookPurchases.UpdateAsync(bookPurchase);
                }
                else
                {
                    var subscriptionPurchase = await _unitOfWork.SubscriptionPurchases.GetByIdAsync(purchaseId);
                    if (subscriptionPurchase != null)
                    {
                        subscriptionPurchase.PaymentStatusId = 3; // Failed
                        subscriptionPurchase.TransactionId = vnpTransactionNo;
                        await _unitOfWork.SubscriptionPurchases.UpdateAsync(subscriptionPurchase);
                    }
                    else
                    {
                        return NotFound("Purchase record not found.");
                    }
                }
                await _unitOfWork.CompleteAsync();
            }

            // Chuyển hướng về frontend sau khi xử lý
            //return Redirect("http://localhost:3000/payment-result?status=" + (vnpResponseCodeInt == 0 ? "success" : "failed"));
            return Redirect("http://localhost:3000/");
        }
    }
}
