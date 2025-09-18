using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class RoleUser
    {
        public int RoleUserId { get; set; }
        public string RoleUserName { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}
