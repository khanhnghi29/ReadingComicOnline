using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Interfaces;
using Infrastructure.Context;
using Core.Entities;
using Dapper;
using Core.Dtos;
using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Data
{
    public class AuthorRepository : IAuthorRepository
    {
        private readonly DapperContext _context;
        public AuthorRepository(DapperContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Author>> GetAllAsync()
        {
            var query = "SELECT * FROM Authors";
            using (var connection = _context.CreateConnection())
            {
                var authors = await connection.QueryAsync<Author>(query);
                return authors.ToList();
            }
        }

        // Lỗi "CS0122: 'Author' is inaccessible due to its protection level" xuất hiện vì lớp Author được khai báo với phạm vi truy cập "internal".
        // Để Dapper và các lớp khác trong các assembly khác truy cập được, bạn cần sửa lại phạm vi truy cập của lớp Author thành "public".

        // Ví dụ, trong file định nghĩa Author (có thể là Core/Entities/Author.cs), hãy sửa lại như sau:
        public async Task<Author> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM Authors WHERE AuthorId = @Id";
            using (var connection = _context.CreateConnection())
            {
                var author = await connection.QuerySingleOrDefaultAsync<Author>(query, new { id });
                return author;
            }

        }
        public async Task<Author> AddSync(AuthorDto entity)
        {
            var checkQuery = "SELECT COUNT(*) FROM Authors WHERE AuthorName = @AuthorName";
            var insertQuery = "INSERT INTO Authors (AuthorName) VALUES (@AuthorName); SELECT SCOPE_IDENTITY();";
            var selectQuery = "SELECT * FROM Authors WHERE AuthorId = @Id";


            var parameters = new DynamicParameters();
            parameters.Add("AuthorName", entity.AuthorName);

            using (var connection = _context.CreateConnection())
            {
                var existingCount = await connection.ExecuteScalarAsync<int>(checkQuery, parameters);
                if (existingCount > 0)
                {
                    throw new InvalidOperationException("Author name already exists.");
                }
                var newId = await connection.ExecuteScalarAsync<int>(insertQuery, parameters);
                var newAuthor = await connection.QuerySingleOrDefaultAsync<Author>(selectQuery, new { Id = newId });

                return newAuthor;
            }

        }
        public async Task UpdateAsync(int id, AuthorDto entity)
        {
            var checkQuery = "SELECT COUNT(*) FROM Authors WHERE AuthorName = @AuthorName AND AuthorId != @Id";
            var query = "UPDATE Authors SET AuthorName = @AuthorName WHERE AuthorId = @Id";

            var parameters = new DynamicParameters();
            parameters.Add("Id", id);
            parameters.Add("AuthorName", entity.AuthorName);

            using (var connection = _context.CreateConnection())
            {
                var existingCount = await connection.ExecuteScalarAsync<int>(checkQuery, parameters);
                if (existingCount > 0)
                {
                    throw new InvalidOperationException("Author name already exists.");
                }
                await connection.ExecuteAsync(query, parameters);
            }

        }
        public async Task DeleteAsync(int id)
        {
            var query = "DELETE FROM Authors WHERE AuthorId = @Id";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, new { id });
            }
        }
    }
}
