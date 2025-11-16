using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Dtos
{
    public class SubscriptionPurchaseDto
    {
        public string UserName { get; set; }
        public int SubscriptionId { get; set; }
        public int PaymentMethodId { get; set; }
        public int PaymentStatusId { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
    }
}
