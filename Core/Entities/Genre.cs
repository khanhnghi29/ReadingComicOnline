using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class Genre
    {
        public int GenreId { get; set; }
        public string GenreName { get; set; }
        public virtual ICollection<ComicGenre> ComicGenres { get; set; }

    }
}
