using BookstoreAPI.Data;
using BookstoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BookstoreAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    // GET: api/books
    [HttpGet("books")]
    public async Task<IActionResult> GetBooks(int pageSize, int pageNum = 1)
    {
        // Validate pageSize and pageNum
        var books = _context.Books
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Get total number of books for pagination
        var totalNumBooks = _context.Books.Count();

        // Create response object with books and total count
        var response = new
        {
            Books = books,
            TotalNumBooks = totalNumBooks
        };

        return Ok(response);
    }
}
