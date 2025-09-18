using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IChapterRepository
    {
        Task<ChapterResponseDto> AddAsync(int comicId, ChapterCreateDto dto);
        Task UpdateAsync(int chapterId, ChapterCreateDto dto);
        Task<IEnumerable<ChapterResponseDto>> GetChaptersByComicIdAsync(int comicId);
        Task<Chapter> GetByIdAsync(int id);
        Task DeleteAsync(int comicId, int chapterId);
    }
}
