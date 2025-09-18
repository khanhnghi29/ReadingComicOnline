using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Dtos
{
    public class ChapterResponseDto
    {
        public int ChapterId { get; set; }
        public int ComicId { get; set; }
        public int ChapterNumber { get; set; }
        public string ChapterTitle { get; set; }
        public DateTime CreateAt { get; set; }
        public List<ChapterImage> ChapterImages { get; set; }
    }
}
