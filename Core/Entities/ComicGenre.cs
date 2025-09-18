using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class ComicGenre
    {
        public int ComicId { get; set; }
        public int GenreId { get; set; }
        public Comic Comic { get; set; }
        public Genre Genre { get; set; }
    }
}
