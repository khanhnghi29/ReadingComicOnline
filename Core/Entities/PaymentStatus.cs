using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class PaymentStatus
    {
        public int PaymentStatusId { get; set; }
        public string StatusName { get; set; }
        public virtual ICollection<BookPurchase> BookPurchases { get; set; }
        public virtual ICollection<SubscriptionPurchase> SubscriptionPurchases { get; set; }
    }
}
