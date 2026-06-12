import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { ShoppingCart, Package, BarChart3, Store, Truck, Users, History } from 'lucide-react'
import Venta from './pages/Venta'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Historial from './pages/Historial'
import Proveedores from './pages/Proveedores'
import Creditos from './pages/Creditos'

export default function App() {
  const location = useLocation()
  const esVenta = location.pathname === '/'

  if (esVenta) {
    return (
      <Routes>
        <Route path="/" element={<Venta />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/creditos" element={<Creditos />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Routes>
        <Route path="/" element={<Venta />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/creditos" element={<Creditos />} />
      </Routes>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-40 lg:hidden">
        <div className="flex items-center justify-around">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Venta</span>
          </NavLink>
          <NavLink to="/historial" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">Historial</span>
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Productos</span>
          </NavLink>
          <NavLink to="/proveedores" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Truck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Prov.</span>
          </NavLink>
          <NavLink to="/creditos" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Creditos</span>
          </NavLink>
        </div>
      </nav>

      <div className="h-16 lg:hidden" />
    </div>
  )
}