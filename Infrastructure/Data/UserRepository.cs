using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Context;
using Dapper;
using Infrastructure.Services;

namespace Infrastructure.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DapperContext _context;
        private readonly PasswordHasher _passwordHasher;

        public UserRepository(DapperContext context, PasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserResponseDto> AddAsync(UserCreateDto dto)
        {
            var (passwordHash, salt) = _passwordHasher.HashPassword(dto.Password);
            var query = @"INSERT INTO Users (UserName, ExternalId, PasswordHash, Salt, RoleId, Email)
                         VALUES (@UserName, @ExternalId, @PasswordHash, @Salt, 1, @Email);
                         SELECT @UserName AS UserName;"; // Gán RoleId = 1 :Reader

            using (var connection = _context.CreateConnection())
            {
                // Kiểm tra username và email đã tồn tại
                var usernameExists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM Users WHERE UserName = @UserName",
                    new { UserName = dto.UserName });
                if (usernameExists > 0)
                {
                    throw new InvalidOperationException("Username already exists.");
                }

                var emailExists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM Users WHERE Email = @Email",
                    new { Email = dto.Email });
                if (emailExists > 0)
                {
                    throw new InvalidOperationException("Email already exists.");
                }

                //await connection.ExecuteAsync(query, new
                //{
                //    UserName = dto.UserName,
                //    PasswordHash = passwordHash,
                //    Salt = salt,
                //    Email = dto.Email
                //});
                await connection.ExecuteAsync(query, new
                {
                    UserName = dto.UserName,
                    ExternalId = $"Local_{dto.UserName}", // Gán ExternalId để sửa lỗi unique constraint ExternalId kết hợp với ProviderName
                    PasswordHash = passwordHash,
                    Salt = salt,
                    Email = dto.Email
                });

                return new UserResponseDto
                {
                    UserName = dto.UserName,
                    Email = dto.Email,
                    RoleId = 1 // Trả về RoleId = 2
                };
            }
        }

        //public async Task<UserResponseDto> AddOAuthUserAsync(string externalId, string providerName, string email, int roleId)
        //{
        //    var query = @"INSERT INTO Users (UserName, ExternalId, ProviderName, RoleId, Email)
        //                 VALUES (@UserName, @ExternalId, @ProviderName, @RoleId, @Email);
        //                 SELECT @UserName AS UserName;";

        //    // Tạo UserName từ externalId
        //    var username = $"{providerName}_{externalId}";

        //    using (var connection = _context.CreateConnection())
        //    {
        //        // Kiểm tra ExternalId và ProviderName
        //        var externalExists = await connection.ExecuteScalarAsync<int>(
        //            "SELECT COUNT(*) FROM Users WHERE ExternalId = @ExternalId AND ProviderName = @ProviderName",
        //            new { ExternalId = externalId, ProviderName = providerName });
        //        if (externalExists > 0)
        //        {
        //            throw new InvalidOperationException("User with this ExternalId and ProviderName already exists.");
        //        }

        //        // Kiểm tra username
        //        var usernameExists = await connection.ExecuteScalarAsync<int>(
        //            "SELECT COUNT(*) FROM Users WHERE UserName = @UserName",
        //            new { UserName = username });
        //        if (usernameExists > 0)
        //        {
        //            throw new InvalidOperationException("Generated username already exists.");
        //        }

        //        // Kiểm tra email
        //        var emailExists = await connection.ExecuteScalarAsync<int>(
        //            "SELECT COUNT(*) FROM Users WHERE Email = @Email",
        //            new { Email = email });
        //        if (emailExists > 0)
        //        {
        //            throw new InvalidOperationException("Email already exists.");
        //        }

        //        // Kiểm tra RoleId
        //        var roleExists = await connection.ExecuteScalarAsync<int>(
        //            "SELECT COUNT(*) FROM RoleUsers WHERE RoleUserId = @RoleId",
        //            new { RoleId = roleId });
        //        if (roleExists == 0)
        //        {
        //            throw new InvalidOperationException($"Role with ID {roleId} does not exist.");
        //        }

        //        await connection.ExecuteAsync(query, new
        //        {
        //            UserName = username,
        //            ExternalId = externalId,
        //            ProviderName = providerName,
        //            RoleId = roleId,
        //            Email = email
        //        });

        //        return new UserResponseDto
        //        {
        //            UserName = username,
        //            Email = email,
        //            RoleId = roleId
        //        };
        //    }
        //}

        public async Task<User> GetByUsernameAsync(string username)
        {
            var query = "SELECT * FROM Users WHERE UserName = @UserName";
            using (var connection = _context.CreateConnection())
            {
                return await connection.QuerySingleOrDefaultAsync<User>(query, new { UserName = username });
            }
        }

        //public async Task<User> GetByExternalIdAsync(string externalId, string providerName)
        //{
        //    var query = "SELECT * FROM Users WHERE ExternalId = @ExternalId AND ProviderName = @ProviderName";
        //    using (var connection = _context.CreateConnection())
        //    {
        //        return await connection.QuerySingleOrDefaultAsync<User>(query, new { ExternalId = externalId, ProviderName = providerName });
        //    }
        //}
    }
}
