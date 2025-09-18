
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Core.Dtos
{
    public class ChapterCreateDto
    {
        public int ChapterNumber { get; set; }
        public string ChapterTitle { get; set; } // Không bắt buộc
        public List<IFormFile> Images { get; set; } = new List<IFormFile>(); // Danh sách ảnh, Key là Images, không phải ChapterImages
    }
}
