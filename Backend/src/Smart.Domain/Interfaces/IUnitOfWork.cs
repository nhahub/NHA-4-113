using Smart.Domain.Entities;

namespace Smart.Domain.Interfaces
{
    // One SaveChangesAsync() per HTTP request, no matter how many repositories were touched.
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<Product> Products { get; }
        IGenericRepository<Supplier> Suppliers { get; }
        IGenericRepository<Customer> Customers { get; }
        IGenericRepository<Warehouse> Warehouses { get; }
        IGenericRepository<Order> Orders { get; }
        IGenericRepository<User> Users { get; }

        Task<int> SaveChangesAsync();
    }
}