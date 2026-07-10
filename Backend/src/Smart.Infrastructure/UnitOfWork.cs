using Smart.Domain.Entities;
using Smart.Domain.Interfaces;
using Smart.Infrastructure.Data;
using Smart.Infrastructure.Repositories;

namespace Smart.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        private IGenericRepository<Category>? _categories;
        private IGenericRepository<Product>? _products;
        private IGenericRepository<Supplier>? _suppliers;
        private IGenericRepository<Customer>? _customers;
        private IGenericRepository<Warehouse>? _warehouses;
        private IGenericRepository<Order>? _orders;
        private IGenericRepository<User>? _users;

        public UnitOfWork(AppDbContext context) => _context = context;

        // Lazily created so we never instantiate a repository we don't use in a given request
        public IGenericRepository<Category> Categories => _categories ??= new GenericRepository<Category>(_context);
        public IGenericRepository<Product> Products => _products ??= new GenericRepository<Product>(_context);
        public IGenericRepository<Supplier> Suppliers => _suppliers ??= new GenericRepository<Supplier>(_context);
        public IGenericRepository<Customer> Customers => _customers ??= new GenericRepository<Customer>(_context);
        public IGenericRepository<Warehouse> Warehouses => _warehouses ??= new GenericRepository<Warehouse>(_context);
        public IGenericRepository<Order> Orders => _orders ??= new GenericRepository<Order>(_context);
        public IGenericRepository<User> Users => _users ??= new GenericRepository<User>(_context);

        public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();

        public void Dispose() => _context.Dispose();
    }
}