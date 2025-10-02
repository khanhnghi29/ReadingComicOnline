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
    public class BookPurchaseRepository : IBookPurchaseRepository
    {
        private readonly DapperContext _context;

        public BookPurchaseRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<BookPurchase> AddAsync(BookPurchase entity)
        {
            var query = @"INSERT INTO BookPurchases (UserName, ComicId, PaymentMethodId, PaymentStatusId, PaymentDate, TransactionId, Amount)
                         VALUES (@UserName, @ComicId, @PaymentMethodId, @PaymentStatusId, @PaymentDate, @TransactionId, @Amount);
                         SELECT SCOPE_IDENTITY();";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
                return entity;
            }
        }

        public async Task UpdateAsync(BookPurchase entity)
        {
            var query = @"UPDATE BookPurchases SET PaymentStatusId = @PaymentStatusId, TransactionId = @TransactionId WHERE PurchaseId = @PurchaseId";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
            }
        }

        public async Task<BookPurchase> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM BookPurchases WHERE PurchaseId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<BookPurchase>(query, new { Id = id });
            }
        }

        public async Task<IEnumerable<BookPurchase>> GetByUserNameAsync(string userName)
        {
            var query = "SELECT * FROM BookPurchases WHERE UserName = @UserName";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<BookPurchase>(query, new { UserName = userName });
            }
        }

        public async Task<IEnumerable<BookPurchase>> GetPurchasedComicsAsync(string userName)
        {
            var query = @"SELECT bp.*, c.Title, c.ComicImageUrl, c.Price 
                         FROM BookPurchases bp 
                         INNER JOIN Comics c ON bp.ComicId = c.ComicId 
                         WHERE bp.UserName = @UserName AND bp.PaymentStatusId = 2"; // Success
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<BookPurchase>(query, new { UserName = userName });
            }
        }
    }
}
