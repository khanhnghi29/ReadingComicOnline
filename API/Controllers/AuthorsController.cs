using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Data;
using Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public AuthorsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Author>>> GetAllAuthors()
        {

            var authors = await _unitOfWork.Authors.GetAllAsync();
            return Ok(authors);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Author>> GetAuthor(int id)
        {
            var author = await _unitOfWork.Authors.GetByIdAsync(id);
            if (author == null)
            {
                return NotFound();
            }
            return Ok(author);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateAuthor(AuthorDto authorDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var newAuthor = await _unitOfWork.Authors.AddSync(authorDto);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetAuthor), new { id = newAuthor.AuthorId }, newAuthor);
            }
            catch(InvalidOperationException ex ) when (ex.Message == "Author name already exists.")
            { 
                return Conflict(new { message = ex.Message });
            }

        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateAuthor(int id, AuthorDto authorDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existingAuthor = await _unitOfWork.Authors.GetByIdAsync(id);
            if (existingAuthor == null)
            {
                return NotFound();
            }
            try
            {
                await _unitOfWork.Authors.UpdateAsync(id, authorDto);
                await _unitOfWork.CompleteAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message == "Author name already exists.")
            {
                return Conflict(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteAuthor(int id)
        {
            var existingAuthor = await _unitOfWork.Authors.GetByIdAsync(id);
            if (existingAuthor == null)
            {
                return NotFound();
            }
            await _unitOfWork.Authors.DeleteAsync(id);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

    }
}