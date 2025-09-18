using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class ChapterImage
    {
        public int ImageId { get; set; }
        public int ChapterId { get; set; }
        public string ImageUrl { get; set; }
        public int ImageOrder { get; set; }
        public Chapter Chapter { get; set; }
   
    }
}
