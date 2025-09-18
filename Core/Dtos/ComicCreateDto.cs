using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Core.Dtos
{
    public class ComicCreateDto
    {
        [Required(ErrorMessage = "Title is required")]
        [JsonPropertyName("title")]
        public string Title { get; set; }
        [JsonPropertyName("comicDescription")]
        public string ComicDescription { get; set; }

        [JsonPropertyName("comicImage")]
        public IFormFile ComicImage { get; set; }
        [Required(ErrorMessage = "AuthorId is required")]
        [JsonPropertyName("authorId")]
        public int AuthorId { get; set; }
        [JsonPropertyName("genreIds")]
        public List<int> GenreIds { get; set; } = new List<int>();

        [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative.")]
        [JsonPropertyName("price")]
        public Decimal Price { get; set; }
    }
}
