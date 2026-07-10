# نظام إدارة المخازن — الفرونت (React)

فرونت داشبورد لإدارة المخازن، مبني بـ React + Vite، بواجهة عربية (RTL) بالكامل، ومقسّم لملفات منطقية يسهل التوسع فيها. البيانات حاليًا وهمية (mock) لحد ما تربطه بالباك اند.

## التشغيل

```bash
npm install
npm run dev
```

المشروع هيشتغل على `http://localhost:5173`

## البناء للإنتاج

```bash
npm run build
```

## هيكل الملفات

```
src/
├── main.jsx              نقطة الدخول - بيربط BrowserRouter
├── App.jsx                الجذر - بينادي على AppRoutes
├── index.css               التوكينز (ألوان/خطوط/مسافات) + استايلات عامة
│
├── routes/
│   └── AppRoutes.jsx      تعريف كل مسارات الصفحات في مكان واحد
│
├── layouts/
│   └── DashboardLayout.jsx  الهيكل العام (Sidebar + Topbar + محتوى الصفحة)
│
├── components/            مكونات قابلة لإعادة الاستخدام في أكتر من صفحة
│   ├── Sidebar.jsx          القائمة الجانبية والتنقل
│   ├── Topbar.jsx           الشريط العلوي (عنوان الصفحة + بحث + إشعارات)
│   ├── StatCard.jsx         كارت إحصائية (KPI) في الداشبورد
│   ├── RackCapacityBar.jsx  شريط نسبة إشغال المخزن (العنصر المميز بالتصميم)
│   ├── DataTable.jsx        جدول بيانات عام (columns/rows)
│   ├── Badge.jsx             وسم صغير للحالة (متوفر / منخفض / إلخ)
│   ├── LowStockAlert.jsx    ودجت تنبيهات المخزون المنخفض
│   └── ActivityFeed.jsx     ودجت آخر الحركات
│
├── pages/                  كل صفحة = مسار كامل ومستقل
│   ├── Dashboard.jsx        الرئيسية / نظرة عامة
│   ├── Products.jsx         إدارة المنتجات
│   ├── Inventory.jsx        الجرد والمخزون لكل مخزن
│   ├── Orders.jsx           أوامر التوريد والصرف
│   ├── Suppliers.jsx        الموردين
│   └── Reports.jsx          التقارير والتحليلات
│
├── data/
│   └── mockData.js         كل البيانات الوهمية في مكان واحد
│
└── utils/
    └── formatters.js       دوال تنسيق الأرقام والعملة وحالة الطلبات
```

## الربط بالباك اند (Smart.CleanArchitecture — ASP.NET Core)

الفرونت ده بقى متصل فعليًا بالباك اند. الشغل ده اتعمل بالفعل:

1. **`src/api/`** — فيه ملف لكل كيان (`client.js`, `products.js`, `categories.js`, `suppliers.js`, `customers.js`) بيتكلموا مباشرة مع `Smart.WebApi` عن طريق `fetch`.
2. **`.env`** — فيه `VITE_API_BASE_URL` وهو عنوان الباك اند. لازم تتأكد إنه مطابق للبورت اللي شغال بيه فعليًا (تلاقيه في الترمينال لما تعمل `dotnet run`، أو في `Backend/src/Smart.WebApi/Properties/launchSettings.json`).
3. **الصفحات المتصلة فعليًا بالـ API:** `Products.jsx`, `Suppliers.jsx`, `Customers.jsx`, وجزء من `Dashboard.jsx` (الإحصائيات وتنبيهات المخزون المنخفض).
4. **الصفحات اللي لسه على mock data:** `Inventory.jsx`, `Orders.jsx`, `Reports.jsx`، وجزء من `Dashboard.jsx` (نسبة إشغال المخازن + حركة التوريد الأسبوعية) — لأن الباك اند لسه مفيهوش Entities لـ Warehouse أو Orders/Movement.

### قبل ما تشغّل المشروعين مع بعض

- شغّل الباك اند الأول (`dotnet run` من `Backend/src/Smart.WebApi`) وتأكد إنه فتح على `https://localhost:7100` (أو غيّر `.env` لو البورت مختلف).
- لو المتصفح رفض الاتصال بسبب الشهادة (self-signed certificate)، شغّل مرة واحدة: `dotnet dev-certs https --trust`.
- بعدين شغّل الفرونت: `npm install` ثم `npm run dev`.
- الباك اند لازم يكون فيه قاعدة بيانات متصلة ومُهاجَرة (migrations) وإلا الصفحات هتفضل فاضية أو تظهر رسالة خطأ تحت العنوان.

## المكتبات المستخدمة

- `react-router-dom` — التنقل بين الصفحات
- `recharts` — الرسوم البيانية (Bar chart في الداشبورد، Pie chart في التقارير)
- `lucide-react` — الأيقونات
