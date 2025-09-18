﻿using Core.Dtos;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtService _jwtService;
        private readonly PasswordHasher _passwordHasher;

        public UsersController(IUnitOfWork unitOfWork, JwtService jwtService, PasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _unitOfWork.Users.AddAsync(dto);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(Register), new { username = user.UserName }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] UserLoginDto dto)
        {
            var user = await _unitOfWork.Users.GetByUsernameAsync(dto.UserName);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            if (string.IsNullOrEmpty(user.PasswordHash) || string.IsNullOrEmpty(user.Salt))
            {
                return Unauthorized(new { message = "User registered via external provider. Use OAuth login." });
            }

            bool isValid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.Salt);
            if (!isValid)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var token = _jwtService.GenerateToken(user);
            return Ok(new { message = "Login successful", token, username = user.UserName, roleId = user.RoleId });
        }
    }
}
