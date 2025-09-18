using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IComicRepository
    {
        Task<ComicResponseDto> AddAsync(ComicCreateDto comicCreateDto);
        Task UpdateAsync(int id, ComicCreateDto comicCreateDto);
        Task<ComicResponseDto> GetComicWithDetailsAsync(int id);
        Task<IEnumerable<ComicResponseDto>> GetAllComicsWithDetailsAsync();
        Task DeleteAsync(int id);
        Task<Comic> GetByIdAsync(int id);
        Task<IEnumerable<Comic>> GetAllAsync();
        Task<(IEnumerable<ComicResponseDto> Comics, int TotalCount)> SearchComicsAsync(string? searchTerm, int page, int pageSize = 30);
        Task<(IEnumerable<ComicResponseDto> Comics, int TotalCount)> GetComicsByGenreAsync(int genreId, int page, int pageSize = 30);
    }
}
