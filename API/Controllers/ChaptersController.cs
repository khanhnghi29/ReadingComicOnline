using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/comics/{comicId}/[controller]")]
    [ApiController]
    public class ChaptersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChaptersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChapterResponseDto>>> GetChaptersByComicId(int comicId)
        {
            var chapters = await _unitOfWork.Chapters.GetChaptersByComicIdAsync(comicId);
            return Ok(chapters);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ChapterResponseDto>> CreateChapter(int comicId, [FromForm] ChapterCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newChapter = await _unitOfWork.Chapters.AddAsync(comicId, dto);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetChapterById), new { comicId, chapterId = newChapter.ChapterId }, newChapter);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{chapterId}")]
        public async Task<ActionResult<ChapterResponseDto>> GetChapterById(int comicId, int chapterId)
        {
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId);
            if (chapter == null || chapter.ComicId != comicId)
            {
                return NotFound();
            }

            var response = new ChapterResponseDto
            {
                ChapterId = chapter.ChapterId,

                ComicId = chapter.ComicId,
                ChapterNumber = chapter.ChapterNumber,
                ChapterTitle = chapter.ChapterTitle,
                CreateAt = chapter.CreateAt,
                ChapterImages = (await _unitOfWork.ChapterImages.GetImagesByChapterIdAsync(chapterId)).ToList()
            };
            return Ok(response);
        }

        [HttpPut("{chapterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateChapter(int comicId, int chapterId, [FromForm] ChapterCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingChapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId);
            if (existingChapter == null || existingChapter.ComicId != comicId)
            {
                return NotFound();
            }

            try
            {
                await _unitOfWork.Chapters.UpdateAsync(chapterId, dto);
                await _unitOfWork.CompleteAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{chapterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteChapter(int comicId, int chapterId)
        {
            try
            {
                await _unitOfWork.Chapters.DeleteAsync(comicId, chapterId);
                await _unitOfWork.CompleteAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
