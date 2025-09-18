using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class Comic
    {
        public int ComicId { get; set; }
        public string Title { get; set; }
        public string ComicImageUrl { get; set; }
        public string ComicDescription { get; set; }
        public int FreeOrNotId { get; set; }
        public int TotalViews { get; set; }
        public int AuthorId { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.Now;

        public decimal Price { get; set; }
        public Author Author { get; set; }
        public virtual ICollection<ComicGenre> ComicGenres { get; set; }
        public virtual ICollection<Chapter> Chapters { get; set; }
        public virtual ICollection<BookPurchase> BookPurchases { get; set; }
    }
}
