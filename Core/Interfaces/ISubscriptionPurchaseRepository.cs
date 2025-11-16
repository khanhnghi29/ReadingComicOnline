using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
    public interface ISubscriptionPurchaseRepository
    {
        Task<int> AddAsync(SubscriptionPurchaseDto entity);
        Task UpdateAsync(SubscriptionPurchase entity);
        Task<SubscriptionPurchase> GetByIdAsync(int id);
        Task<IEnumerable<SubscriptionPurchase>> GetByUserNameAsync(string userName);
        Task<IEnumerable<SubscriptionPurchase>> GetActiveSubscriptionsAsync(string userName);
    }
}
