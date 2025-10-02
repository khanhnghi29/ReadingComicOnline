using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Core.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
   
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryMinutes;

        public JwtService(string secretKey, string issuer, string audience, int expiryMinutes = 60)
        {
            _secretKey = secretKey;
            _issuer = issuer;
            _audience = audience;
            _expiryMinutes = expiryMinutes;
        }

        public string GenerateToken(User user)
        {
            var roleName = user.RoleId == 1 ? "Reader" : user.RoleId == 2 ? "Admin" : "Unknown";
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(ClaimTypes.Role, roleName), // Sử dụng tên role (Reader hoặc Admin)
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("roleId", user.RoleId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(_expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
