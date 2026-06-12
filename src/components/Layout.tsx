import { NavLink } from 'react-router-dom'
import { ShoppingCart, Package, BarChart3, Store, Truck, Users, History, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: ShoppingCart, label: 'Venta' },
  { path: '/historial', icon: History, label: 'Historial' },
  { path: '/productos', icon: Package, label: 'Productos' },
  { path: '/inventario', icon: Store, label: 'Inventario' },
  { path: '/proveedores', icon: Truck, label: 'Proveedores' },
  { path: '/creditos', icon: Users, label: 'Creditos' },
  { path: '/reportes', icon: BarChart3, label: 'Reportes' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 text-white fixed h-full z-30">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Store className="w-6 h-6" /></div>
            <div><h1 className="font-bold text-lg leading-tight">Miscelanea</h1><p className="text-xs text-slate-400">Irving POS</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon className="w-5 h-5" /><span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">v1.0 - Punto de Venta</div>
      </aside>

      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><Store className="w-5 h-5" /></div>
            <span className="font-bold">Irving POS</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-slate-800 rounded-lg">{menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/95 z-40 p-4 pt-20">
            <nav className="space-y-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-lg ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon className="w-6 h-6" /><span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 z-30">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-5 h-5" /><span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}