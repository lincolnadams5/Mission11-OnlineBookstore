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
    public async Task<IActionResult> GetBooks(int pageSize, int pageNum = 1, string? category = null)
    {
        // Get all books from the database
        var query = _context.Books.AsQueryable();

        // Filter by category if provided
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
        }

        // Validate pageSize and pageNum
        var books = query
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Get total number of books for pagination
        var totalNumBooks = query.Count();

        // Create response object with books and total count
        var response = new
        {
            Books = books,
            TotalNumBooks = totalNumBooks
        };

        return Ok(response);
    }
    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = _context.Books
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToList();
        
        return Ok(categories);
    }
}
