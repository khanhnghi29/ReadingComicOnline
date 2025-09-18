using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Dtos
{
    public class ComicResponseDto
    {
        [JsonPropertyName("comicId")]
        public int ComicId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }
        [JsonPropertyName("comicImageUrl")]
        public string ComicImageUrl { get; set; }

        [JsonPropertyName("comicDescription")]
        public string ComicDescription { get; set; }

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("totalViews")]
        public int TotalViews { get; set; }

        [JsonPropertyName("authorId")]
        public int AuthorId { get; set; }

        [JsonPropertyName("createAt")]
        public DateTime CreateAt { get; set; }
        public Author Author { get; set; }
        public List<Genre> Genres { get; set; }
        public List<ChapterResponseDto> Chapters { get; set; }
    }
}
