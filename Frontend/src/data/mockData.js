// بيانات وهمية (Mock Data) — لسه مستخدمة في الصفحات دي بس، لعدم وجود
// Entities مقابلة في الباك اند حاليًا: Inventory.jsx, Orders.jsx, Reports.jsx،
// وكمان جزء من Dashboard.jsx (المخازن warehouses، وحركة التوريد/الصرف الأسبوعية).
// أما Products.jsx و Suppliers.jsx و Customers.jsx فبقوا متصلين فعليًا
// بالـ API الحقيقي (شوف مجلد src/api/) ومبقوش بيستوردوا من هنا.

export const warehouses = [
  { id: 'wh-1', name: 'المخزن الرئيسي - القاهرة', capacityUsed: 78 },
  { id: 'wh-2', name: 'مخزن الإسكندرية', capacityUsed: 45 },
  { id: 'wh-3', name: 'مخزن العاشر من رمضان', capacityUsed: 92 },
]

export const categories = ['إلكترونيات', 'أدوات منزلية', 'مواد غذائية', 'قطع غيار', 'مستلزمات مكتبية']

export const products = [
  { id: 'PRD-1001', name: 'شاشة LED 24 بوصة', category: 'إلكترونيات', sku: 'ELE-2401', quantity: 42, reorderLevel: 20, unitPrice: 3200, warehouse: 'wh-1' },
  { id: 'PRD-1002', name: 'لابتوب Core i5 - جيل 12', category: 'إلكترونيات', sku: 'ELE-1205', quantity: 8, reorderLevel: 10, unitPrice: 18500, warehouse: 'wh-1' },
  { id: 'PRD-1003', name: 'مروحة سقف كهربائية', category: 'أدوات منزلية', sku: 'HOM-0311', quantity: 65, reorderLevel: 15, unitPrice: 850, warehouse: 'wh-2' },
  { id: 'PRD-1004', name: 'خلاط كهربائي 5 سرعات', category: 'أدوات منزلية', sku: 'HOM-0522', quantity: 5, reorderLevel: 12, unitPrice: 620, warehouse: 'wh-2' },
  { id: 'PRD-1005', name: 'كرتونة أرز 10 كجم', category: 'مواد غذائية', sku: 'FOD-1090', quantity: 130, reorderLevel: 40, unitPrice: 410, warehouse: 'wh-1' },
  { id: 'PRD-1006', name: 'زيت طهي 5 لتر', category: 'مواد غذائية', sku: 'FOD-0550', quantity: 18, reorderLevel: 25, unitPrice: 320, warehouse: 'wh-3' },
  { id: 'PRD-1007', name: 'طقم مفكات دقيقة', category: 'قطع غيار', sku: 'SPR-0771', quantity: 54, reorderLevel: 20, unitPrice: 145, warehouse: 'wh-3' },
  { id: 'PRD-1008', name: 'فلتر زيت سيارات', category: 'قطع غيار', sku: 'SPR-0902', quantity: 12, reorderLevel: 15, unitPrice: 90, warehouse: 'wh-3' },
  { id: 'PRD-1009', name: 'ورق طباعة A4 - رزمة', category: 'مستلزمات مكتبية', sku: 'OFF-0140', quantity: 200, reorderLevel: 50, unitPrice: 130, warehouse: 'wh-1' },
  { id: 'PRD-1010', name: 'طابعة ليزر أحادية اللون', category: 'مستلزمات مكتبية', sku: 'OFF-0630', quantity: 3, reorderLevel: 8, unitPrice: 4200, warehouse: 'wh-1' },
]

// العملاء
export const customers = [
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '01001234567',
    address: 'القاهرة، مصر',
    category: 'فردي'
  },
  {
    id: 2,
    name: 'شركة النيل للتجارة',
    email: 'info@nilecompany.com',
    phone: '01008765432',
    address: 'الإسكندرية، مصر',
    category: 'شركة'
  },
  {
    id: 3,
    name: 'مؤسسة السلام',
    email: 'salam@foundation.com',
    phone: '01005554433',
    address: 'الجيزة، مصر',
    category: 'مؤسسة'
  },
  {
    id: 4,
    name: 'سارة خالد',
    email: 'sara@example.com',
    phone: '01002223344',
    address: 'شرم الشيخ، مصر',
    category: 'فردي'
  },
  {
    id: 5,
    name: 'الهيئة العامة للاستثمار',
    email: 'invest@gov.eg',
    phone: '01009998877',
    address: 'القاهرة الجديدة، مصر',
    category: 'حكومي'
  }
]

export const suppliers = [
  { id: 'SUP-01', name: 'شركة النور للتوريدات', phone: '01012345678', category: 'إلكترونيات', rating: 4.6 },
  { id: 'SUP-02', name: 'مؤسسة الأمل التجارية', phone: '01198765432', category: 'مواد غذائية', rating: 4.2 },
  { id: 'SUP-03', name: 'مصنع الدلتا للأدوات', phone: '01234567890', category: 'أدوات منزلية', rating: 4.8 },
  { id: 'SUP-04', name: 'شركة المستقبل لقطع الغيار', phone: '01555512345', category: 'قطع غيار', rating: 3.9 },
]

export const orders = [
  {
    id: 'ORD-5001',
    type: 'صرف',
    product: 'شاشة LED 24 بوصة',
    quantity: 6,
    unitPrice: 3500,
    totalAmount: 21000,
    paidAmount: 21000,
    remainingAmount: 0,
    warehouse: 'المخزن الرئيسي',
    status: 'مكتمل',
    date: '2026-07-06',
    returns: [],
  },
  {
    id: 'ORD-5002',
    type: 'توريد',
    product: 'زيت طهي 5 لتر',
    quantity: 50,
    unitPrice: 180,
    totalAmount: 9000,
    paidAmount: 3000,
    remainingAmount: 6000,
    warehouse: 'مخزن الأغذية',
    status: 'غير مكتمل',
    date: '2026-07-07',
    returns: [],
  },
]

export const activityLog = [
  { id: 1, text: 'تم صرف 6 وحدات من "شاشة LED 24 بوصة"', time: 'منذ 12 دقيقة', kind: 'out' },
  { id: 2, text: 'تنبيه: مخزون "خلاط كهربائي 5 سرعات" وصل للحد الأدنى', time: 'منذ ساعة', kind: 'alert' },
  { id: 3, text: 'تم استلام توريد جديد: 50 كرتونة "زيت طهي 5 لتر"', time: 'منذ 3 ساعات', kind: 'in' },
  { id: 4, text: 'تم تحديث بيانات المورد "مصنع الدلتا للأدوات"', time: 'أمس', kind: 'update' },
  { id: 5, text: 'تنبيه: مخزون "فلتر زيت سيارات" وصل للحد الأدنى', time: 'أمس', kind: 'alert' },
]

export function getStats() {
  const totalProducts = products.length
  const lowStock = products.filter((p) => p.quantity <= p.reorderLevel).length
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
  return { totalProducts, lowStock, totalUnits, totalValue }
}

export function getLowStockProducts() {
  return products.filter((p) => p.quantity <= p.reorderLevel)
}

export function getWeeklyMovement() {
  return [
    { day: 'السبت', توريد: 40, صرف: 24 },
    { day: 'الأحد', توريد: 30, صرف: 28 },
    { day: 'الاثنين', توريد: 55, صرف: 40 },
    { day: 'الثلاثاء', توريد: 20, صرف: 35 },
    { day: 'الأربعاء', توريد: 48, صرف: 30 },
    { day: 'الخميس', توريد: 60, صرف: 45 },
    { day: 'الجمعة', توريد: 25, صرف: 15 },
  ]
}

export function getCategoryBreakdown() {
  return categories.map((cat) => ({
    name: cat,
    value: products.filter((p) => p.category === cat).reduce((s, p) => s + p.quantity, 0),
  }))
}
