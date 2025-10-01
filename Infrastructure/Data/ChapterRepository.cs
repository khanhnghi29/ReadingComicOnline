using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;
using Core.Interfaces;
using Dapper;
using Infrastructure.Context;
using Infrastructure.Services;
using Microsoft.AspNetCore.Hosting;
using static System.Net.Mime.MediaTypeNames;

namespace Infrastructure.Data
{
    public class ChapterRepository : IChapterRepository
    {
        private readonly DapperContext _context;
        private readonly UploadService _uploadService;
        private readonly IChapterImageRepository _chapterImageRepository;
        private IWebHostEnvironment _environment;
        public ChapterRepository(DapperContext context, UploadService uploadService, IWebHostEnvironment environment, IChapterImageRepository chapterImageRepository)
        {
            _context = context;
            _uploadService = uploadService;
            _environment = environment;
            _chapterImageRepository = chapterImageRepository;
        }
        public async Task<ChapterResponseDto> AddAsync(int comicId, ChapterCreateDto entity)
        {
            Console.WriteLine($"AddAsync: ComicId={comicId}, ChapterNumber={entity.ChapterNumber}, ChapterTitle={entity.ChapterTitle}, ImagesCount={entity.Images?.Count ?? 0}");
            var query = @"INSERT INTO Chapters (ComicId, ChapterNumber, ChapterTitle, CreateAt) 
                          VALUES (@ComicId, @ChapterNumber, @ChapterTitle, GETDATE()); 
                          SELECT SCOPE_IDENTITY();";
            var parameters = new DynamicParameters();
            parameters.Add("ComicId", comicId);
            parameters.Add("ChapterNumber", entity.ChapterNumber);
            parameters.Add("ChapterTitle", entity.ChapterTitle ?? "");

            using (var connection = _context.CreateConnection())
            {
                // Kiểm tra ComicId tồn tại
                var comicExists = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Comics WHERE ComicId = @Id", new { Id = comicId });
                if (comicExists == 0)
                {
                    throw new InvalidOperationException("Comic does not exist.");
                }

                var chapterId = await connection.ExecuteScalarAsync<int>(query, parameters);

                // Upload và lưu ảnh
                if (entity.Images != null && entity.Images.Any())
                {
                    Console.WriteLine($"Uploading {entity.Images.Count} images for ChapterId={chapterId}");
                    // Sắp xếp ảnh theo tên file (nếu không có ImageOrder thủ công)
                    var sortedImages = entity.Images
                        .Select((file, index) => new { File = file, Name = file.FileName, Index = index })
                        .OrderBy(x => x.Name)
                        .Select(x => x.File)
                        .ToList();

                    var imageUrls = await _uploadService.UploadChapterImagesAsync(comicId, chapterId, sortedImages);
                    for (int i = 0; i < imageUrls.Count; i++)
                    {
                        var imageQuery = "INSERT INTO ChapterImages (ChapterId, ImageUrl, ImageOrder) VALUES (@ChapterId, @ImageUrl, @ImageOrder)";
                        await connection.ExecuteAsync(imageQuery, new { ChapterId = chapterId, ImageUrl = imageUrls[i], ImageOrder = i + 1 });
                    }
                }
                else
                {
                    Console.WriteLine("No images provided in ChapterCreateDto");
                }
                var selectQuery = "SELECT * FROM Chapters WHERE ChapterId = @Id";
                var chapter = await connection.QuerySingleOrDefaultAsync<Chapter>(selectQuery, new { Id = chapterId });
                var images = (await connection.QueryAsync<ChapterImage>("SELECT * FROM ChapterImages WHERE ChapterId = @ChapterId ORDER BY ImageOrder", new { ChapterId = chapterId })).ToList();
                Console.WriteLine($"Retrieved {images.Count} images for ChapterId={chapterId}");
                return new ChapterResponseDto
                {
                    ChapterId = chapter.ChapterId,
                    ComicId = chapter.ComicId,
                    ChapterNumber = chapter.ChapterNumber,
                    ChapterTitle = chapter.ChapterTitle,
                    CreateAt = chapter.CreateAt,
                    ChapterImages = images
                };
            }
        }

        public async Task UpdateAsync(int chapterId, ChapterCreateDto dto)
        {
            var query = "UPDATE Chapters SET ChapterNumber = @ChapterNumber, ChapterTitle = @ChapterTitle WHERE ChapterId = @ChapterId";
            var parameters = new DynamicParameters();
            parameters.Add("ChapterId", chapterId);
            parameters.Add("ChapterNumber", dto.ChapterNumber);
            parameters.Add("ChapterTitle", dto.ChapterTitle ?? "");

            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, parameters);

                // Cập nhật ảnh nếu có
                if (dto.Images != null && dto.Images.Any())
                {
                    var deleteImagesQuery = "DELETE FROM ChapterImages WHERE ChapterId = @ChapterId";
                    await connection.ExecuteAsync(deleteImagesQuery, new { ChapterId = chapterId });

                    var comicId = await connection.QuerySingleAsync<int>("SELECT ComicId FROM Chapters WHERE ChapterId = @ChapterId", new { ChapterId = chapterId });
                    var sortedImages = dto.Images
                        .Select((file, index) => new { File = file, Name = file.FileName, Index = index })
                        .OrderBy(x => x.Name)
                        .Select(x => x.File)
                        .ToList();

                    var imageUrls = await _uploadService.UploadChapterImagesAsync(comicId, chapterId, sortedImages);
                    for (int i = 0; i < imageUrls.Count; i++)
                    {
                        var imageQuery = "INSERT INTO ChapterImages (ChapterId, ImageUrl, ImageOrder) VALUES (@ChapterId, @ImageUrl, @ImageOrder)";
                        await connection.ExecuteAsync(imageQuery, new { ChapterId = chapterId, ImageUrl = imageUrls[i], ImageOrder = i + 1 });
                    }
                }
            }
        }

        public async Task<IEnumerable<ChapterResponseDto>> GetChaptersByComicIdAsync(int comicId)
        {
            var query = "SELECT * FROM Chapters WHERE ComicId = @ComicId ORDER BY ChapterNumber";
            var imagesQuery = "SELECT * FROM ChapterImages WHERE ChapterId = @ChapterId ORDER BY ImageOrder";

            using (var connection = _context.CreateConnection())
            {
                var chapters = await connection.QueryAsync<Chapter>(query, new { ComicId = comicId });
                var response = new List<ChapterResponseDto>();
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
                    response.Add(chapterResponse);
                }
                return response;
            }
        }

        public async Task<Chapter> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM Chapters WHERE ChapterId = @Id";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<Chapter>(query, new { Id = id });
            }
        }

        public async Task<IEnumerable<Chapter>> GetAllAsync()
        {
            var query = "SELECT * FROM Chapters";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QueryAsync<Chapter>(query);
            }
        }

        public async Task AddAsync(Chapter entity)
        {
            var query = "INSERT INTO Chapters (ComicId, ChapterNumber, ChapterTitle, CreateAt) VALUES (@ComicId, @ChapterNumber, @ChapterTitle, GETDATE())";
            using (var connection = _context.CreateConnection())
            {
                await connection.ExecuteAsync(query, entity);
            }
        }

        //public async Task UpdateAsync(Chapter entity)
        //{
        //    var query = "UPDATE Chapters SET ChapterNumber = @ChapterNumber, ChapterTitle = @ChapterTitle WHERE ChapterId = @ChapterId";
        //    using (var connection = _context.CreateConnection())
        //    {
        //        await connection.ExecuteAsync(query, entity);
        //    }
        //}
        

        public async Task DeleteAsync(int comicId, int chapterId)
        {
            using (var connection = _context.CreateConnection())
            {
                // Kiểm tra chapter có tồn tại và thuộc comicId không
                var chapterExists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM Chapters WHERE ChapterId = @ChapterId AND ComicId = @ComicId",
                    new { ChapterId = chapterId, ComicId = comicId });
                if (chapterExists == 0)
                {
                    throw new InvalidOperationException($"Chapter with ID {chapterId} does not exist or does not belong to Comic with ID {comicId}.");
                }

                // Xóa ChapterImages
                var existingImages = await _chapterImageRepository.GetImagesByChapterIdAsync(chapterId);
                foreach (var image in existingImages)
                {
                    await _chapterImageRepository.DeleteAsync(image.ImageId);
                }

                // Xóa Chapter
                var deleteChapterQuery = "DELETE FROM Chapters WHERE ChapterId = @ChapterId AND ComicId = @ComicId";
                await connection.ExecuteAsync(deleteChapterQuery, new { ChapterId = chapterId, ComicId = comicId });

                // Xóa thư mục ảnh
                var webRootPath = _environment.WebRootPath ?? "";
                var chapterFolderPath = Path.Combine(webRootPath, "images", "comics", comicId.ToString(), "chapters", chapterId.ToString());
                if (Directory.Exists(chapterFolderPath))
                {
                    Directory.Delete(chapterFolderPath, true);
                }
            }
        }

    }
}
