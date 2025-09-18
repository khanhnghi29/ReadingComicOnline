using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;

namespace Core.Interfaces
{
    public interface IUserRepository
    {
        Task<UserResponseDto> AddAsync(UserCreateDto dto);
        Task<User> GetByUsernameAsync(string username);

    }
}
