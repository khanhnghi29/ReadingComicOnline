using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComicsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public ComicsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComicResponseDto>>> GetAllComics()
        {
            var comics = await _unitOfWork.Comics.GetAllComicsWithDetailsAsync();
            return Ok(comics);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ComicResponseDto>> GetComicById(int id)
        {
            var comic = await _unitOfWork.Comics.GetComicWithDetailsAsync(id);
            if (comic == null)
            {
                return NotFound();
            }
            return Ok(comic);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ComicResponseDto>> CreateComic([FromForm] ComicCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newComic = await _unitOfWork.Comics.AddAsync(dto);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetComicById), new { id = newComic.ComicId }, newComic);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateComic(int id, [FromForm] ComicCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingComic = await _unitOfWork.Comics.GetByIdAsync(id);
            if (existingComic == null)
            {
                return NotFound();
            }

            try
            {
                await _unitOfWork.Comics.UpdateAsync(id, dto);
                await _unitOfWork.CompleteAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteComic(int id)
        {
            var comic = await _unitOfWork.Comics.GetByIdAsync(id);
            if (comic == null)
            {
                return NotFound();
            }

            await _unitOfWork.Comics.DeleteAsync(id);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ComicResponseDto>>> SearchComics([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            if (page < 1)
            {
                return BadRequest(new { message = "Page must be greater than or equal to 1." });
            }
            if (pageSize <= 0)
            {
                return BadRequest(new { message = "PageSize must be greater than 0." });
            }

            var (comics, totalCount) = await _unitOfWork.Comics.SearchComicsAsync(searchTerm, page, pageSize);
            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("Access-Control-Expose-Headers", "X-Total-Count");
            return Ok(comics);
        }

        [HttpGet("genre/{genreId}")]
        public async Task<ActionResult<IEnumerable<ComicResponseDto>>> GetComicsByGenre(int genreId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            if (page < 1)
            {
                return BadRequest(new { message = "Page must be greater than or equal to 1." });
            }
            if (pageSize <= 0)
            {
                return BadRequest(new { message = "PageSize must be greater than 0." });
            }

            var (comics, totalCount) = await _unitOfWork.Comics.GetComicsByGenreAsync(genreId, page, pageSize);
            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("Access-Control-Expose-Headers", "X-Total-Count");
            return Ok(comics);
        }
    }
}
