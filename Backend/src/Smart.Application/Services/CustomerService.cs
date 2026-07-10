using System.Linq.Expressions;
using Smart.Application.Common;
using Smart.Application.DTOs.Customer;
using Smart.Application.Interfaces;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly IUnitOfWork _uow;
        public CustomerService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<CustomerDto>> GetAllAsync()
        {
            var customers = await _uow.Customers.GetAllAsync();
            return customers.Select(ToDto).ToList();
        }

        public async Task<PagedResult<CustomerDto>> GetPagedAsync(int page, int pageSize, string? search = null)
        {
            Expression<Func<Customer, bool>>? filter = null;
            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim();
                filter = c =>
                    c.Name.Contains(q) ||
                    c.Email.Contains(q) ||
                    c.Phone.Contains(q) ||
                    c.Category.Contains(q) ||
                    (c.Address != null && c.Address.Contains(q));
            }

            var (items, totalCount) = await _uow.Customers.GetPagedAsync(page, pageSize, filter);
            return new PagedResult<CustomerDto>
            {
                Items = items.Select(ToDto).ToList(),
                Page = page < 1 ? 1 : page,
                PageSize = pageSize < 1 ? 20 : pageSize,
                TotalCount = totalCount,
            };
        }

        public async Task<CustomerDto?> GetByIdAsync(int id)
        {
            var customer = await _uow.Customers.GetByIdAsync(id);
            return customer == null ? null : ToDto(customer);
        }

        public async Task<ServiceResult<CustomerDto>> CreateAsync(CreateCustomerDto dto)
        {
            var emailTaken = await _uow.Customers.AnyAsync(c => c.Email == dto.Email);
            if (emailTaken)
                return ServiceResult<CustomerDto>.Fail("A customer with this email already exists.");

            var customer = new Customer
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                Category = dto.Category
            };

            await _uow.Customers.AddAsync(customer);
            await _uow.SaveChangesAsync();
            return ServiceResult<CustomerDto>.Ok(ToDto(customer));
        }

        public async Task<ServiceResult<CustomerDto>> UpdateAsync(int id, UpdateCustomerDto dto)
        {
            var customer = await _uow.Customers.GetByIdAsync(id);
            if (customer == null)
                return ServiceResult<CustomerDto>.Fail("Customer not found.");

            var emailTaken = await _uow.Customers.AnyAsync(c => c.Email == dto.Email && c.Id != id);
            if (emailTaken)
                return ServiceResult<CustomerDto>.Fail("A customer with this email already exists.");

            customer.Name = dto.Name;
            customer.Email = dto.Email;
            customer.Phone = dto.Phone;
            customer.Address = dto.Address;
            customer.Category = dto.Category;
            customer.UpdatedAt = DateTime.UtcNow;

            _uow.Customers.Update(customer);
            await _uow.SaveChangesAsync();
            return ServiceResult<CustomerDto>.Ok(ToDto(customer));
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var customer = await _uow.Customers.GetByIdAsync(id);
            if (customer == null)
                return ServiceResult<bool>.Fail("Customer not found.");

            _uow.Customers.Remove(customer);
            await _uow.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }

        private static CustomerDto ToDto(Customer c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Email = c.Email,
            Phone = c.Phone,
            Address = c.Address,
            Category = c.Category
        };
    }
}