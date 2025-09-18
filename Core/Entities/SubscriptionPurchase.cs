using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class SubscriptionPurchase
    {
        public int PurchaseId { get; set; }
        public string UserName { get; set; }
        public int SubscriptionId { get; set; }
        public int PaymnetMethodId { get; set; }
        public int PaymentStatusId { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime ExpireDate { get; set; }
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
        public User User { get; set; }
        public Subscription Subscription { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; }

    }
}