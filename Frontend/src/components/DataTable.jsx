// جدول بيانات عام قابل لإعادة الاستخدام.
// columns: [{ key, header, render?(row) }]
export default function DataTable({ columns, rows, emptyText = 'لا توجد بيانات لعرضها' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'start',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--color-border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id ?? i} style={{ borderBottom: '1px solid var(--color-border)' }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--color-text)' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
