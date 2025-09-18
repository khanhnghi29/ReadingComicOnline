using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace Infrastructure.Services
{
    public class UploadService
    {
        private readonly IWebHostEnvironment _environment;

        public UploadService(IWebHostEnvironment environment)
        {
            _environment = environment ?? throw new ArgumentNullException(nameof(environment));
        }

        public async Task<string> UploadComicCoverAsync(int comicId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is required.");
            }

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(extension))
            {
                throw new ArgumentException("Invalid file type.");
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File too large.");
            }

            var webRootPath = _environment.WebRootPath ?? "";
            var comicIdStr = comicId.ToString();
            var folderPath = Path.Combine(webRootPath, "images", "comics", comicIdStr);
            Directory.CreateDirectory(folderPath);

            var fileName = $"cover{extension}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/images/comics/{comicIdStr}/cover{extension}";
        }

        public async Task<List<string>> UploadChapterImagesAsync(int comicId, int chapterId, List<IFormFile> files)
        {
            if (files == null || !files.Any())
            {
                throw new ArgumentException("Files are required.");
            }

            var urls = new List<string>();
            var sortedFiles = files
                .Select((file, index) => new { File = file, Name = file.FileName, Index = index })
                .OrderBy(x => x.Name)
                .Select(x => x.File)
                .ToList();

            var webRootPath = _environment.WebRootPath ?? "";
            var comicIdStr = comicId.ToString();
            var chapterIdStr = chapterId.ToString();
            var folderPath = Path.Combine(webRootPath, "images", "comics", comicIdStr, "chapters", chapterIdStr);
            Directory.CreateDirectory(folderPath);

            for (int i = 0; i < sortedFiles.Count; i++)
            {
                var file = sortedFiles[i];
                var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(extension))
                {
                    throw new ArgumentException("Invalid file type.");
                }

                if (file.Length > 5 * 1024 * 1024)
                {
                    throw new ArgumentException("File too large.");
                }

                var guid = Guid.NewGuid().ToString();
                var fileName = $"{guid}_{i + 1}{extension}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                urls.Add($"/images/comics/{comicIdStr}/chapters/{chapterIdStr}/{fileName}");
            }
            return urls;
        }

    }
}
