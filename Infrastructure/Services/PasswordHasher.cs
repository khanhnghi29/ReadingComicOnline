using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class PasswordHasher
    {
        public (string PasswordHash, string Salt) HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));
            }

            // Tạo salt ngẫu nhiên (16 byte)
            byte[] saltBytes = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            string salt = Convert.ToHexString(saltBytes);

            // Kết hợp password và salt, sau đó băm bằng SHA-512
            string combined = password + salt;
            using (var sha512 = SHA512.Create())
            {
                byte[] hashBytes = sha512.ComputeHash(Encoding.UTF8.GetBytes(combined));
                string hash = Convert.ToHexString(hashBytes);
                return (hash, salt);
            }
        }

        public bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash) || string.IsNullOrEmpty(storedSalt))
            {
                return false;
            }

            // Kết hợp password và storedSalt, băm và so sánh
            string combined = password + storedSalt;
            using (var sha512 = SHA512.Create())
            {
                byte[] hashBytes = sha512.ComputeHash(Encoding.UTF8.GetBytes(combined));
                string computedHash = Convert.ToHexString(hashBytes);
                return computedHash.Equals(storedHash, StringComparison.OrdinalIgnoreCase);
            }
        }
    }
}
