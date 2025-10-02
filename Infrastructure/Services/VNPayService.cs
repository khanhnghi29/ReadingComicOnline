using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class VNPayService
    {
        private readonly string _vnp_TmnCode;
        private readonly string _vnp_HashSecret;
        private readonly string _vnp_Url;
        private readonly string _vnp_ReturnUrl;

        public VNPayService(IConfiguration configuration)
        {
            _vnp_TmnCode = configuration["VNPay:TmnCode"];
            _vnp_HashSecret = configuration["VNPay:HashSecret"];
            _vnp_Url = configuration["VNPay:Url"];
            _vnp_ReturnUrl = configuration["VNPay:ReturnUrl"];
        }

        public string CreatePaymentUrl(string orderId, decimal amount, string userName, string orderInfo)
        {
            var vnpParams = new SortedDictionary<string, string>
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _vnp_TmnCode },
                { "vnp_Amount", ((int)(amount * 100)).ToString() },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", "127.0.0.1" },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", HttpUtility.UrlEncode(orderInfo) },
                { "vnp_OrderType", "250000" },
                { "vnp_ReturnUrl", _vnp_ReturnUrl },
                { "vnp_TxnRef", orderId },
                { "vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss") }
            };

            // Debug: Log tham số và chuỗi ký
            Console.WriteLine("VNPay Parameters:");
            foreach (var param in vnpParams)
            {
                Console.WriteLine($"{param.Key}={param.Value}");
            }

            var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={kvp.Value}"));
            Console.WriteLine("SignData: " + signData);

            var vnp_SecureHash = HmacSha512(signData, _vnp_HashSecret);
            Console.WriteLine("vnp_SecureHash: " + vnp_SecureHash);

            vnpParams.Add("vnp_SecureHash", vnp_SecureHash);

            var paymentUrl = _vnp_Url + "?" + string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={kvp.Value}"));
            Console.WriteLine("PaymentUrl: " + paymentUrl);

            return paymentUrl;
        }

        public bool VerifyPayment(NameValueCollection queryParams)
        {
            var vnp_SecureHash = queryParams["vnp_SecureHash"];
            queryParams.Remove("vnp_SecureHash");

            var signData = string.Join("&", queryParams.AllKeys
                .OrderBy(k => k)
                .Select(k => $"{k}={HttpUtility.UrlEncode(queryParams[k])}"));
            Console.WriteLine("Verify SignData: " + signData);

            var checkSum = HmacSha512(signData, _vnp_HashSecret);
            Console.WriteLine("Verify vnp_SecureHash: " + checkSum);

            return checkSum.Equals(vnp_SecureHash, StringComparison.InvariantCultureIgnoreCase);
        }

        private string HmacSha512(string input, string key)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }
    }
    //public class VNPayService
    //{
    //    private readonly string _vnpTmnCode;
    //    private readonly string _vnpHashSecret;
    //    private readonly string _vnpUrl;
    //    private readonly string _vnpReturnUrl;

    //    public VNPayService(IConfiguration configuration)
    //    {
    //        _vnpTmnCode = configuration["VNPay:TmnCode"];
    //        _vnpHashSecret = configuration["VNPay:HashSecret"];
    //        _vnpUrl = configuration["VNPay:Url"];
    //        _vnpReturnUrl = configuration["VNPay:ReturnUrl"];
    //    }

    //    public string CreatePaymentUrl(string orderId, decimal amount, string userName, string description = "Thanh toán mua comic")
    //    {
    //        var vnpayData = new NameValueCollection
    //        {
    //            { "vnp_Version", "2.1.0" },
    //            { "vnp_Command", "pay" },
    //            { "vnp_TmnCode", _vnpTmnCode },
    //            { "vnp_Amount", ((int)(amount * 100)).ToString() }, // VNPay dùng đơn vị VND * 100
    //            { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") },
    //            { "vnp_CurrCode", "VND" },
    //            { "vnp_IpAddr", GetClientIp() }, // Cần lấy IP từ request
    //            { "vnp_Locale", "vn" },
    //            { "vnp_OrderInfo", description },
    //            { "vnp_OrderType", "other" },
    //            { "vnp_ReturnUrl", _vnpReturnUrl },
    //            { "vnp_TxnRef", orderId }
    //        };

    //        var signData = Common.BuildCheckoutData(vnpayData);
    //        vnpayData.Add("vnp_SecureHash", Common.HmacSHA512(_vnpHashSecret, signData));

    //        var queryString = string.Join("&", vnpayData.AllKeys.Select(key => $"{key}={vnpayData[key]}"));
    //        return $"{_vnpUrl}?{queryString}";
    //    }

    //    public bool VerifyPayment(NameValueCollection queryParams)
    //    {
    //        var vnpayData = new NameValueCollection(queryParams);
    //        var secureHash = vnpayData["vnp_SecureHash"];
    //        vnpayData.Remove("vnp_SecureHash");

    //        var signData = Common.BuildCheckoutData(vnpayData);
    //        var hashedData = Common.HmacSHA512(_vnpHashSecret, signData);

    //        return secureHash.Equals(hashedData, StringComparison.OrdinalIgnoreCase);
    //    }

    //    public PaymentStatus GetPaymentStatus(NameValueCollection queryParams)
    //    {
    //        var vnp_ResponseCode = queryParams["vnp_ResponseCode"];
    //        if (vnp_ResponseCode == "00")
    //        {
    //            return PaymentStatus.Success; // Thành công
    //        }
    //        else if (vnp_ResponseCode == "07")
    //        {
    //            return PaymentStatus.Failed; // Hủy
    //        }
    //        else
    //        {
    //            return PaymentStatus.Pending; // Đang xử lý
    //        }
    //    }

    //    private string GetClientIp()
    //    {
    //        // Lấy IP từ HttpContext (cần inject IHttpContextAccessor)
    //        return "127.0.0.1"; // Mặc định cho test
    //    }
    //}

    //public enum PaymentStatus
    //{
    //    Pending = 1,
    //    Success = 2,
    //    Failed = 3
    //}

    //public static class Common
    //{
    //    public static string HmacSHA512(string key, string data)
    //    {
    //        using (var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key)))
    //        {
    //            byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    //            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    //        }
    //    }

    //    public static string BuildCheckoutData(NameValueCollection queryParams)
    //    {
    //        var sortedKeys = queryParams.AllKeys.Where(key => key != "vnp_SecureHash").OrderBy(key => key).ToArray();
    //        var sb = new StringBuilder();
    //        foreach (var key in sortedKeys)
    //        {
    //            sb.Append(key).Append("=").Append(queryParams[key]).Append("&");
    //        }
    //        return sb.ToString().TrimEnd('&');
    //    }
    //}
}
