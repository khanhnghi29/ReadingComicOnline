using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
     public interface IAuthorRepository
    {
        public Task<IEnumerable<Author>> GetAllAsync();
        public Task<Author> GetByIdAsync(int id);
        public Task<Author> AddSync(AuthorDto entity);
        public Task UpdateAsync(int id, AuthorDto entity);
        public Task DeleteAsync(int id);
    }
}
