using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IBookPurchaseRepository
    {
        Task<int> AddAsync(BookPurchaseDto entity);
        Task UpdateAsync(BookPurchase entity);
        Task<BookPurchase> GetByIdAsync(int id);
        Task<IEnumerable<BookPurchase>> GetByUserNameAsync(string userName);
        Task<IEnumerable<BookPurchasedResponseDto>> GetPurchasedComicsAsync(string userName);
    }
}
