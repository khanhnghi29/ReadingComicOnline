using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;
using Infrastructure.Context;
using Dapper;
using Core.Interfaces;  
namespace Infrastructure.Data
{
    public class SubscriptionPurchaseRepository : ISubscriptionPurchaseRepository
    {
        private readonly DapperContext _context;

        public SubscriptionPurchaseRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<SubscriptionPurchase> AddAsync(SubscriptionPurchase entity)
        {
            var query = @"INSERT INTO SubscriptionPurchases (UserName, SubscriptionId, PaymentMethodId, PaymentStatusId, PaymentDate, ExpireDate, TransactionId, Amount)
                         VALUES (@UserName, @SubscriptionId, @PaymentMethodId, @PaymentStatusId, @PaymentDate, @ExpireDate, @TransactionId, @Amount);
                         SELECT SCOPE_IDENTITY();";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
                return entity;
            }
        }

        public async Task UpdateAsync(SubscriptionPurchase entity)
        {
            var query = @"UPDATE SubscriptionPurchases SET PaymentStatusId = @PaymentStatusId, TransactionId = @TransactionId WHERE PurchaseId = @PurchaseId";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
            }
        }

        public async Task<SubscriptionPurchase> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM SubscriptionPurchases WHERE PurchaseId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<SubscriptionPurchase>(query, new { Id = id });
            }
        }

        public async Task<IEnumerable<SubscriptionPurchase>> GetByUserNameAsync(string userName)
        {
            var query = "SELECT * FROM SubscriptionPurchases WHERE UserName = @UserName";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<SubscriptionPurchase>(query, new { UserName = userName });
            }
        }

        public async Task<IEnumerable<SubscriptionPurchase>> GetActiveSubscriptionsAsync(string userName)
        {
            var query = @"SELECT * FROM SubscriptionPurchases WHERE UserName = @UserName AND PaymentStatusId = 2 AND ExpireDate > GETDATE()";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<SubscriptionPurchase>(query, new { UserName = userName });
            }
        }
    }
}
