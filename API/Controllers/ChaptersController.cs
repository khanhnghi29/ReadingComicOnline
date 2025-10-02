using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
        [AllowAnonymous] // Cho phép truy cập không cần đăng nhập
        public async Task<ActionResult<ChapterResponseDto>> GetChapterById(int comicId, int chapterId)
        {
            // Lấy thông tin chapter
            var chapter = await _unitOfWork.Chapters.GetByIdAsync(chapterId);
            if (chapter == null || chapter.ComicId != comicId)
            {
                return NotFound("Chapter or Comic not found.");
            }

            // Lấy thông tin comic để kiểm tra giá
            var comic = await _unitOfWork.Comics.GetByIdAsync(comicId);
            if (comic == null)
            {
                return NotFound("Comic not found.");
            }

            // Kiểm tra quyền truy cập
            if (comic.Price > 0) // Comic có phí
            {
                //var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                var userName = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                var isAdmin = User.IsInRole("Admin");

                if (!isAdmin) // Không phải Admin
                {
                    if (string.IsNullOrEmpty(userName)) // Chưa đăng nhập
                    {
                        return Unauthorized("You must be logged in to access paid content.");
                    }

                    // Kiểm tra BookPurchase
                    var hasPurchased = await _unitOfWork.BookPurchases.GetPurchasedComicsAsync(userName);
                    var isPurchased = hasPurchased.Any(p => p.ComicId == comicId && p.PaymentStatusId == 2);

                    // Kiểm tra SubscriptionPurchase còn hiệu lực
                    var activeSubscriptions = await _unitOfWork.SubscriptionPurchases.GetActiveSubscriptionsAsync(userName);
                    var hasActiveSubscription = activeSubscriptions.Any();

                    if (!isPurchased && !hasActiveSubscription)
                    {
                        return Forbid("You have not purchased this comic or have an active subscription.");
                    }
                }
            }

            // Tạo response
            var response = new ChapterResponseDto
            {
                ChapterId = chapter.ChapterId,
                ComicId = chapter.ComicId,
                ChapterNumber = chapter.ChapterNumber,
                ChapterTitle = chapter.ChapterTitle,
                CreateAt = chapter.CreateAt,
                ChapterImages = (await _unitOfWork.ChapterImages.GetImagesByChapterIdAsync(chapterId)).ToList()
            };

            // Tăng view chỉ khi truy cập thành công
            await _unitOfWork.Comics.IncrementViewAsync(comicId);
            await _unitOfWork.CompleteAsync();

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
