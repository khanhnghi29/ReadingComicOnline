using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        // Define methods for the repository interface
     public Task<IEnumerable<T>> GetAllAsync();
     public Task<T> GetByIdAsync(int id);        
     public Task AddAsync(T entity);
     public Task UpdateAsync(T entity);
     public Task DeleteAsync(int id);
    }
}
