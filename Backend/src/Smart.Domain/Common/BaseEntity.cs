namespace Smart.Domain.Common
{
    // Every entity gets an Id + basic audit fields for free.
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false; // soft delete flag
    }
}
