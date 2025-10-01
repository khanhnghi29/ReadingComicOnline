using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure.Services;
using Core.Entities;
using Dapper;
using Core.Dtos;
using Core.Interfaces;
using Microsoft.Data.SqlClient;
using Infrastructure.Context;
using Microsoft.AspNetCore.Hosting;

namespace Infrastructure.Data
{
    public class ComicRepository : IComicRepository
    {
        private readonly DapperContext _context;
        private readonly UploadService _uploadService;
        private IWebHostEnvironment _environment;
        public ComicRepository(DapperContext context, UploadService uploadService, IWebHostEnvironment environment)
        {
            _context = context;
            _uploadService = uploadService;
            _environment = environment;
        }
        public async Task<ComicResponseDto> AddAsync(ComicCreateDto entity)
        {
            var insertQuery = "INSERT INTO Comics (Title, ComicImageUrl, ComicDescription, Price, AuthorId, CreateAt) VALUES (@Title , '', @ComicDescription, @Price, @AuthorId, GETDATE()); SELECT SCOPE_IDENTITY();";


            var parameters = new DynamicParameters();
            parameters.Add("Title", entity.Title);
            parameters.Add("ComicDescription", entity.ComicDescription);
            parameters.Add("Price", entity.Price);
            parameters.Add("AuthorId", entity.AuthorId);

            using (var connection = _context.CreateConnection())
            {
                var comicId = await connection.ExecuteScalarAsync<int>(insertQuery, parameters);

                // Upload Cover Image if exists
                if (entity.ComicImage != null)
                {
                    var imageUrl = await _uploadService.UploadComicCoverAsync(comicId, entity.ComicImage);
                    var updateImageQuery = "UPDATE Comics SET ComicImageUrl = @ComicImageUrl WHERE ComicId = @Id";
                    await connection.ExecuteAsync(updateImageQuery, new { ComicImageUrl = imageUrl, Id = comicId });
                }

                if (entity.GenreIds != null && entity.GenreIds.Count > 0)
                {
                    foreach (var genreId in entity.GenreIds)
                    {
                        var insertGenreQuery = "INSERT INTO ComicGenres (ComicId, GenreId) VALUES (@ComicId, @GenreId)";
                        var genreParameters = new DynamicParameters();
                        genreParameters.Add("ComicId", comicId);
                        genreParameters.Add("GenreId", genreId);
                        await connection.ExecuteAsync(insertGenreQuery, genreParameters);
                    }
                }
                return await GetComicWithDetailsAsync(comicId);
            }
        }
        public async Task<ComicResponseDto> GetComicWithDetailsAsync(int id)
        {
            var comicQuery = "SELECT * FROM Comics WHERE ComicId = @Id";
            var genresQuery = "SELECT g.* FROM Genres g INNER JOIN ComicGenres cg ON g.GenreId = cg.GenreId WHERE cg.ComicId = @Id";
            var chaptersQuery = "SELECT * FROM Chapters WHERE ComicId = @Id ORDER BY ChapterNumber";
            var imagesQuery = "SELECT * FROM ChapterImages WHERE ChapterId = @ChapterId ORDER BY ImageOrder";
            var authorQuery = "SELECT * FROM Authors WHERE AuthorId = @AuthorId";

            using (var connection = _context.CreateConnection())
            {
                var comic = await connection.QuerySingleOrDefaultAsync<Comic>(comicQuery, new { Id = id });
                if (comic == null) return null;

                var response = new ComicResponseDto
                {
                    ComicId = comic.ComicId,
                    Title = comic.Title,
                    ComicImageUrl = comic.ComicImageUrl,
                    ComicDescription = comic.ComicDescription,
                    Price = comic.Price,
                    TotalViews = comic.TotalViews,
                    AuthorId = comic.AuthorId,
                    CreateAt = comic.CreateAt,
                    Author = await connection.QuerySingleOrDefaultAsync<Author>(authorQuery, new { AuthorId = comic.AuthorId }),
                    Genres = (await connection.QueryAsync<Genre>(genresQuery, new { Id = id })).ToList(),
                    Chapters = new List<ChapterResponseDto>()
                };

                var chapters = await connection.QueryAsync<Chapter>(chaptersQuery, new { Id = id });
                foreach (var chapter in chapters)
                {
                    var chapterResponse = new ChapterResponseDto
                    {
                        ChapterId = chapter.ChapterId,
                        ComicId = chapter.ComicId,
                        ChapterNumber = chapter.ChapterNumber,
                        ChapterTitle = chapter.ChapterTitle,
                        CreateAt = chapter.CreateAt,
                        ChapterImages = (await connection.QueryAsync<ChapterImage>(imagesQuery, new { ChapterId = chapter.ChapterId })).ToList()
                    };
                    response.Chapters.Add(chapterResponse);
                }

                return response;
            }
        }
        public async Task UpdateAsync(int id, ComicCreateDto entity)
        {
            var query = @"UPDATE Comics SET Title = @Title, ComicDescription = @ComicDescription, Price = @Price, AuthorId = @AuthorId WHERE ComicId = @Id";
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);
            parameters.Add("Title", entity.Title);
            parameters.Add("ComicDescription", entity.ComicDescription);
            parameters.Add("Price", entity.Price);
            parameters.Add("AuthorId", entity.AuthorId);


            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, parameters);

                // Update ảnh bìa nếu có
                if (entity.ComicImage != null)
                {
                    var imageUrl = await _uploadService.UploadComicCoverAsync(id, entity.ComicImage);
                    var updateImageQuery = "UPDATE Comics SET ComicImageUrl = @ComicImageUrl WHERE ComicId = @Id";
                    await connection.ExecuteAsync(updateImageQuery, new { ComicImageUrl = imageUrl, Id = id });
                }

                // Update Genres
                var deleteGenresQuery = "DELETE FROM ComicGenres WHERE ComicId = @Id";
                await connection.ExecuteAsync(deleteGenresQuery, new { Id = id });

                foreach (var genreId in entity.GenreIds)
                {
                    var genreQuery = "INSERT INTO ComicGenres (ComicId, GenreId) VALUES (@ComicId, @GenreId)";
                    await connection.ExecuteAsync(genreQuery, new { ComicId = id, GenreId = genreId });
                }
            }
        }
        public async Task DeleteAsync(int id)
        {
            var deleteComicGenresQuery = "DELETE FROM ComicGenres WHERE ComicId = @Id";
            var deleteChapterImagesQuery = "DELETE FROM ChapterImages WHERE ChapterId IN (SELECT ChapterId FROM Chapters WHERE ComicId = @Id)";
            var deleteChaptersQuery = "DELETE FROM Chapters WHERE ComicId = @Id";
            var deleteComicQuery = "DELETE FROM Comics WHERE ComicId = @Id";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(deleteComicGenresQuery, new { Id = id });
                await connection.ExecuteAsync(deleteChapterImagesQuery, new { Id = id });
                await connection.ExecuteAsync(deleteChaptersQuery, new { Id = id });
                await connection.ExecuteAsync(deleteComicQuery, new { Id = id });
            }
            // Xóa thư mục ảnh bìa và ảnh chương
            var comicFolderPath = Path.Combine(_environment.WebRootPath, "images", "comics", id.ToString());
            if (Directory.Exists(comicFolderPath))
            {
                Directory.Delete(comicFolderPath, true);
            }
        }
        public async Task<Comic> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM Comics WHERE ComicId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<Comic>(query, new { Id = id });
            }
        }

        public async Task<IEnumerable<Comic>> GetAllAsync()
        {
            var query = "SELECT * FROM Comics";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<Comic>(query);
            }
        }
        public async Task<IEnumerable<ComicResponseDto>> GetAllComicsWithDetailsAsync()
        {
            var query = "SELECT * FROM Comics";
            using (var connection = _context.CreateConnection())
            {
                var comics = await connection.QueryAsync<Comic>(query);
                var response = new List<ComicResponseDto>();
                foreach (var comic in comics)
                {
                    var comicResponse = await GetComicWithDetailsAsync(comic.ComicId);
                    if (comicResponse != null)
                        response.Add(comicResponse);
                }
                return response;
            }
        }
        public async Task<(IEnumerable<ComicResponseDto> Comics, int TotalCount)> SearchComicsAsync(string? searchTerm, int page, int pageSize = 30)
        {
            var offset = (page - 1) * pageSize;
            string query;
            string countQuery;
            var parameters = new DynamicParameters();
            parameters.Add("Offset", offset);
            parameters.Add("PageSize", pageSize);

            if (string.IsNullOrEmpty(searchTerm))
            {
                query = @"SELECT * FROM Comics ORDER BY CreateAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
                countQuery = @"SELECT COUNT(*) FROM Comics";
            }
            else
            {
                query = @"SELECT * FROM Comics WHERE LOWER(Title) LIKE LOWER(@SearchTerm) ORDER BY CreateAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
                countQuery = @"SELECT COUNT(*) FROM Comics WHERE LOWER(Title) LIKE LOWER(@SearchTerm)";
                parameters.Add("SearchTerm", $"%{searchTerm}%");
            }

            using (var connection = _context.CreateConnection())
            {
                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, parameters);
                var comics = await connection.QueryAsync<Comic>(query, parameters);
                var response = new List<ComicResponseDto>();
                foreach (var comic in comics)
                {
                    var comicResponse = await GetComicWithDetailsAsync(comic.ComicId);
                    if (comicResponse != null)
                        response.Add(comicResponse);
                }
                return (response, totalCount);
            }
        }
        public async Task<(IEnumerable<ComicResponseDto> Comics, int TotalCount)> GetComicsByGenreAsync(int genreId, int page, int pageSize = 30)
        {
            var offset = (page - 1) * pageSize;
            var query = @"SELECT c.* FROM Comics c INNER JOIN ComicGenres cg ON c.ComicId = cg.ComicId WHERE cg.GenreId = @GenreId ORDER BY c.CreateAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
            var countQuery = @"SELECT COUNT(*) FROM Comics c INNER JOIN ComicGenres cg ON c.ComicId = cg.ComicId WHERE cg.GenreId = @GenreId";

            using (var connection = _context.CreateConnection())
            {
                var totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { GenreId = genreId });
                var comics = await connection.QueryAsync<Comic>(query, new { GenreId = genreId, Offset = offset, PageSize = pageSize });
                var response = new List<ComicResponseDto>();
                foreach (var comic in comics)
                {
                    var comicResponse = await GetComicWithDetailsAsync(comic.ComicId);
                    if (comicResponse != null)
                        response.Add(comicResponse);
                }
                return (response, totalCount);
            }
        }
        public async Task IncrementViewAsync(int comicId)
        {
            var query = "UPDATE Comics SET TotalViews = TotalViews + 1 WHERE ComicId = @Id";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, new { Id = comicId });
            }
        }
    }
}
