import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  ShoppingCart, Package, BarChart3, Store, Users, 
  History, Truck, Menu, X, LogOut, ScanLine
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()
  
  const menuItems = [
    { to: '/', icon: ShoppingCart, label: 'Punto de Venta', color: 'text-blue-600' },
    { to: '/historial', icon: History, label: 'Historial', color: 'text-gray-600' },
    { to: '/productos', icon: Package, label: 'Productos', color: 'text-gray-600' },
    { to: '/inventario', icon: Store, label: 'Inventario', color: 'text-gray-600' },
    { to: '/creditos', icon: Users, label: 'Creditos', color: 'text-gray-600' },
    { to: '/proveedores', icon: Truck, label: 'Proveedores', color: 'text-gray-600' },
    { to: '/reportes', icon: BarChart3, label: 'Reportes', color: 'text-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full shadow-xl z-40">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Miscelanea</h1>
              <p className="text-xs text-gray-400">Punto de Venta</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <LogOut className="w-4 h-4" />
            <span>v1.0 - Irving</span>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-sm">Miscelanea Irving</span>
          </div>
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuAbierto && (
          <nav className="bg-slate-800 p-3 space-y-1 border-t border-slate-700">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}