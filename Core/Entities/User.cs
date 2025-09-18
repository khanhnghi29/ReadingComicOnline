using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class User
    {
        public string UserName { get; set; }
        public string ExternalId { get; set; }
        public string ProviderName { get; set; }
        public string PasswordHash { get; set; }
        public string Salt { get; set; }
        public int RoleId { get; set; }
        public string Email { get; set; }
        public RoleUser RoleUser { get; set; }
        public virtual ICollection<BookPurchase> BookPurchases { get; set; }
        public virtual ICollection<SubscriptionPurchase> SubscriptionPurchases { get; set; }
    }
}

