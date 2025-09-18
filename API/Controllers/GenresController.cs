using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Core.Entities;
using Core.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public GenresController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Genre>>> GetAllGenres()
        {
            var genres = await _unitOfWork.Genres.GetAllAsync();
            return Ok(genres);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Genre>> GetGenre(int id)
        {
            var genre = await _unitOfWork.Genres.GetByIdAsync(id);
            if (genre == null)
            {
                return NotFound();
            }
            return Ok(genre);
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Genre>> CreateGenre(GenreDto genreDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var newGenre = await _unitOfWork.Genres.AddAsync(genreDto);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetGenre), new { id = newGenre.GenreId }, newGenre);
            }
            catch (InvalidOperationException ex) when (ex.Message == "Genre name already exists.")
            {
                return Conflict(new { message = ex.Message });
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateGenre(int id, GenreDto genreDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existingGenre = await _unitOfWork.Genres.GetByIdAsync(id);
            if (existingGenre == null)
            {
                return NotFound();
            }
            try
            {
                await _unitOfWork.Genres.UpdateAsync(id, genreDto);
                await _unitOfWork.CompleteAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message == "Genre name already exists.")
            {
                return Conflict(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteGenre(int id)
        {
            var existingGenre = await _unitOfWork.Genres.GetByIdAsync(id);
            if (existingGenre == null)
            {
                return NotFound();
            }
            await _unitOfWork.Genres.DeleteAsync(id);
            await _unitOfWork.CompleteAsync();
            return NoContent();

        }
    }
}
