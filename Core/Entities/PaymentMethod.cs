using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class PaymentMethod
    {
        public int PaymentMethodId { get; set; }
        public string MethodName { get; set; }
        public string DescriptionMethod { get; set; }
        public virtual ICollection<BookPurchase> BookPurchases { get; set; }
        public virtual ICollection<SubscriptionPurchase> SubscriptionPurchases { get; set; }
    }
}
