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
    public class ChapterImageRepository : IChapterImageRepository
    {
        private readonly DapperContext _context;

        public ChapterImageRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChapterImage>> GetImagesByChapterIdAsync(int chapterId)
        {
            var query = "SELECT * FROM ChapterImages WHERE ChapterId = @ChapterId ORDER BY ImageOrder";
            using (var connection = _context.CreateConnection())
            {

                return await connection.QueryAsync<ChapterImage>(query, new { ChapterId = chapterId });
            }
        }

        public async Task<ChapterImage> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM ChapterImages WHERE ImageId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<ChapterImage>(query, new { Id = id });
            }
        }

        public async Task<IEnumerable<ChapterImage>> GetAllAsync()
        {
            var query = "SELECT * FROM ChapterImages";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<ChapterImage>(query);
            }
        }

        public async Task AddAsync(ChapterImage entity)
        {
            var query = "INSERT INTO ChapterImages (ChapterId, ImageUrl, ImageOrder) VALUES (@ChapterId, @ImageUrl, @ImageOrder)";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
            }
        }

        public async Task UpdateAsync(ChapterImage entity)
        {
            var query = "UPDATE ChapterImages SET ChapterId = @ChapterId, ImageUrl = @ImageUrl, ImageOrder = @ImageOrder WHERE ImageId = @ImageId";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
            }
        }

        public async Task DeleteAsync(int id)
        {
            var query = "DELETE FROM ChapterImages WHERE ImageId = @Id";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, new { Id = id });
            }
        }
    }
}
