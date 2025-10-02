using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Dapper;
using Infrastructure.Context;

namespace Infrastructure.Data
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly DapperContext _context;
        public SubscriptionRepository(DapperContext context)
        {
            _context = context;
        }
        // Implement methods for managing subscriptions
        public async Task<Subscription> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM Subscriptions WHERE SubscriptionId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<Subscription>(query, new { Id = id });
            }
        }
    }
}
