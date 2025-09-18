using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;
using Core.Interfaces;
using Dapper;
using Infrastructure.Context;
using Microsoft.Identity.Client;
namespace Infrastructure.Data;



public class GenreRepository : IGenreRepository
{
    private readonly DapperContext _context;
    public GenreRepository(DapperContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Genre>> GetAllAsync()
    {
        var query = "SELECT * FROM Genres";
        using (var connection = _context.CreateConnection())
        {
            var genres = await connection.QueryAsync<Genre>(query);
            return genres.ToList();
        }
    }
    public async Task<Genre> GetByIdAsync(int id)
    {
        var query = "SELECT * FROM Genres WHERE GenreId = @Id";

        using (var connection = _context.CreateConnection())
        {
            var genre = await connection.QuerySingleOrDefaultAsync<Genre>(query, new { id });
            return genre;
        }
    }
    public async Task<Genre> AddAsync(GenreDto entity)
    {
        var checkQuery = "SELECT COUNT(*) FROM Genres WHERE GenreName = @GenreName";
        var insertQuery = "INSERT INTO Genres (GenreName) VALUES (@GenreName); SELECT SCOPE_IDENTITY();";
        var selectQuery = "SELECT * FROM Genres WHERE GenreId = @Id";

        var parameters = new DynamicParameters();
        parameters.Add("GenreName", entity.GenreName);

        using (var connection = _context.CreateConnection())
        {
            var existingCount = await connection.ExecuteScalarAsync<int>(checkQuery, parameters);
            if(existingCount > 0)
            {
                throw new InvalidOperationException("Genre name already exists.");
            }
            var newId = await connection.ExecuteScalarAsync<int>(insertQuery, parameters);
            var newGenre = await connection.QuerySingleOrDefaultAsync<Genre>(selectQuery, new { Id = newId });
            return newGenre;
        }
    }
    public async Task UpdateAsync(int id, GenreDto entity)
    {
        var checkQuery = "SELECT COUNT(*) FROM Genres WHERE GenreName = @GenreName AND GenreId != @Id";
        var query = "UPDATE Genres SET GenreName = @GenreName WHERE GenreId = @Id";

        var parameters = new DynamicParameters();
        parameters.Add("Id", id);
        parameters.Add("GenreName", entity.GenreName);

        using (var connection = _context.CreateConnection())
        {
            var existingCount = await connection.ExecuteScalarAsync<int>(checkQuery, parameters);
            if(existingCount > 0)
            {
                throw new InvalidOperationException("Genre name already exists.");
            }
            await connection.ExecuteAsync(query, parameters);
        }
    }
    public async Task DeleteAsync(int id)
    {
        var query = "DELETE FROM Genres WHERE GenreId = @Id";
        using (var connection = _context.CreateConnection())
        {
            await connection.ExecuteAsync(query, new { id });
        }
    }
}
