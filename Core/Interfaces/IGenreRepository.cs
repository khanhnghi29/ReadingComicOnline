using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;
using Core.Dtos;
namespace Core.Interfaces
{
     public interface IGenreRepository
    {
        public Task<IEnumerable<Genre>> GetAllAsync();
        public Task<Genre> GetByIdAsync(int id);
        public Task<Genre> AddAsync(GenreDto entity);
        public Task UpdateAsync(int id, GenreDto entity);
        public Task DeleteAsync(int id);
    }
}
