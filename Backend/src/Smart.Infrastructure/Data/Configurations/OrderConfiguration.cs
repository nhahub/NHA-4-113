using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Smart.Domain.Entities;

namespace Smart.Infrastructure.Data.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasOne(o => o.Product)
                .WithMany()
                .HasForeignKey(o => o.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Warehouse)
                .WithMany(w => w.Orders)
                .HasForeignKey(o => o.WarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            // Self-referencing link from a "مرتجع" (return) order back to the order it returns
            // against. NoAction avoids SQL Server's multiple-cascade-path error on a self-FK.
            builder.HasOne(o => o.OriginalOrder)
                .WithMany()
                .HasForeignKey(o => o.OriginalOrderId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}