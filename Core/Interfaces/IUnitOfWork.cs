using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IAuthorRepository Authors { get; }
        IGenreRepository Genres { get; }
        IComicRepository Comics { get; }
        IChapterRepository Chapters { get; }
        IChapterImageRepository ChapterImages { get; }
        IUserRepository Users { get; }

        Task<int> CompleteAsync();

    }
}
