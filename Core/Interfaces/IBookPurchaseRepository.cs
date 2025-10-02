using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IBookPurchaseRepository
    {
        Task<BookPurchase> AddAsync(BookPurchase entity);
        Task UpdateAsync(BookPurchase entity);
        Task<BookPurchase> GetByIdAsync(int id);
        Task<IEnumerable<BookPurchase>> GetByUserNameAsync(string userName);
        Task<IEnumerable<BookPurchase>> GetPurchasedComicsAsync(string userName);
    }
}
