using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class Subscription
    {
        public int SubscriptionId { get; set; }
        public Decimal Price { get; set; }
        public int Duration { get; set; }
        public virtual ICollection<SubscriptionPurchase> SubscriptionPurchases { get; set; }
    }
}
