using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Interfaces;
using Infrastructure.Context;
using Infrastructure.Services;
using Microsoft.AspNetCore.Hosting;

namespace Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DapperContext _context;
        private readonly IDbConnection _connection;
        private readonly IDbTransaction _transaction;
        private readonly UploadService _uploadService;
        private readonly PasswordHasher _passwordHasher;
        private readonly IWebHostEnvironment _environment;
        private bool _disposed;
        public IAuthorRepository Authors { get; }
        public IGenreRepository Genres { get; }
        public IComicRepository Comics { get; }
        public IChapterRepository Chapters { get; }
        public IChapterImageRepository ChapterImages { get; }
        public IUserRepository Users { get; }

        public UnitOfWork(DapperContext context, UploadService uploadService, IWebHostEnvironment environment, PasswordHasher passwordHasher)
        {
            _context = context;
            _uploadService = uploadService;
            _environment = environment;
            _connection = _context.CreateConnection();
            _connection.Open();
            _transaction = _connection.BeginTransaction();
            Authors = new AuthorRepository(context);
            Genres = new GenreRepository(context);
            ChapterImages = new ChapterImageRepository(context); // Khởi tạo trước để truyền vào ChapterRepository
            Comics = new ComicRepository(context, uploadService, environment);
            Chapters = new ChapterRepository(context, uploadService, environment, ChapterImages); //error here
            Users = new UserRepository(context, passwordHasher);
        }
        public async Task<int> CompleteAsync()
        {
            try
            {
                if(_transaction != null)
                {
                    _transaction.Commit();                 
                }
                return 1; // Trả về số bản ghi đã thay đổi (nếu cần)
            }
            catch
            {
                if(_transaction != null)
                {
                    _transaction.Rollback();
                }
                throw;
            }

        }
        public void Dispose() 
        {
            // Giải phóng tài nguyên nếu cần
            if (!_disposed)
            {
                if (_transaction != null)
                {
                    _transaction.Dispose();
                }
                if (_connection != null)
                {
                    _connection.Dispose();
                }
                _disposed = true;
            }
        }
    }
}
