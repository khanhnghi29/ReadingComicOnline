using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class Chapter
    {
        public int ChapterId { get; set; }
        public int ComicId { get; set; }
        public int ChapterNumber { get; set; }
        public string ChapterTitle { get; set; }
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public Comic Comic { get; set; }
        public virtual ICollection<ChapterImage> ChapterImages { get; set; }
    }
}
