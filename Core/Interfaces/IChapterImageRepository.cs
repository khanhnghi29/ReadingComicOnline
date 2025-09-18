using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IChapterImageRepository
    {
        Task<IEnumerable<ChapterImage>> GetImagesByChapterIdAsync(int chapterId);
        Task<ChapterImage> GetByIdAsync(int id);
        Task<IEnumerable<ChapterImage>> GetAllAsync();
        Task AddAsync(ChapterImage entity);
        Task UpdateAsync(ChapterImage entity);
        Task DeleteAsync(int id);
    }
}
