using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Dtos
{
    public class UserCreateDto
    {
        public string UserName { get; set; }
        public string Password { get; set; }  //clear text password for creation
        public string Email { get; set; }
    }
}
