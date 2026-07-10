import { Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard.jsx'
import Products from '../pages/Products.jsx'
import Categories from '../pages/Categories.jsx'
import Inventory from '../pages/Inventory.jsx'
import Orders from '../pages/Orders.jsx'
import Suppliers from '../pages/Suppliers.jsx'
import Customers from '../pages/Customers.jsx'
import Reports from '../pages/Reports.jsx'
import Login from '../pages/Login.jsx'
import RequireAuth from '../components/RequireAuth.jsx'
import RequireRole from '../components/RequireRole.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Staff + Admin */}
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
      <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
      <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

      {/* Admin only */}
      <Route
        path="/suppliers"
        element={
          <RequireAuth>
            <RequireRole role="Admin"><Suppliers /></RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/customers"
        element={
          <RequireAuth>
            <RequireRole role="Admin"><Customers /></RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth>
            <RequireRole role="Admin"><Reports /></RequireRole>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
