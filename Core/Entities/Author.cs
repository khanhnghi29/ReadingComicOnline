using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class Author
    {
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
        public virtual ICollection<Comic> Comics { get; set; }
    }
}
