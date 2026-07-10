using System.Linq.Expressions;
using Smart.Domain.Common;

namespace Smart.Domain.Interfaces
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id, params string[] includes);
        Task<IReadOnlyList<T>> GetAllAsync(params string[] includes);
        // page مبني على 1 (أول صفحة = 1، مش 0). بيرجّع الصفوف المطلوبة + العدد الكلي
        // للصفوف (عشان الفرونت يعرف كام صفحة موجودة إجمالًا).
        // filter (اختياري): بيتطبّق على كل الداتا سيت قبل الـ Skip/Take، فالبحث بيشتغل
        // عبر كل الصفوف مش بس الصفحة المحمّلة حاليًا.
        Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? filter = null, params string[] includes);
        Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity); // performs a soft delete (sets IsDeleted = true)
    }
}