import { useState } from 'react'
import { BarChart3, TrendingUp, Calendar, DollarSign, Package, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Datos de ejemplo - en producción vendrían de Supabase
const ventasPorDia = [
  { dia: 'Lun', ventas: 2450 },
  { dia: 'Mar', ventas: 3200 },
  { dia: 'Mie', ventas: 2800 },
  { dia: 'Jue', ventas: 4100 },
  { dia: 'Vie', ventas: 3800 },
  { dia: 'Sab', ventas: 5200 },
  { dia: 'Dom', ventas: 4600 },
]

const ventasPorCategoria = [
  { name: 'Bebidas', value: 35, color: '#3b82f6' },
  { name: 'Alimentos', value: 25, color: '#22c55e' },
  { name: 'Dulces', value: 15, color: '#f59e0b' },
  { name: 'Cerveza', value: 15, color: '#8b5cf6' },
  { name: 'Otros', value: 10, color: '#6b7280' },
]

const productosTop = [
  { nombre: 'Coca Cola 600ml', cantidad: 45, total: 585 },
  { nombre: 'Cerveza Corona', cantidad: 38, total: 760 },
  { nombre: 'Sabritas Adobadas', cantidad: 32, total: 416 },
  { nombre: 'Galletas María', cantidad: 28, total: 280 },
  { nombre: 'Red Bull', cantidad: 25, total: 625 },
]

export default function Reportes() {
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('hoy')

  const stats = {
    ventasHoy: 4250.00,
    ventasSemana: 28450.00,
    ventasMes: 125680.00,
    ticketPromedio: 85.50,
    productosVendidos: 48,
    clientesHoy: 32
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
            <p className="text-gray-500">Análisis de ventas</p>
          </div>
        </div>

        {/* Selector de período */}
        <div className="flex gap-2 mb-6">
          {(['hoy', 'semana', 'mes'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                periodo === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-500">Ventas {periodo}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ${periodo === 'hoy' ? stats.ventasHoy.toFixed(2) : periodo === 'semana' ? stats.ventasSemana.toFixed(2) : stats.ventasMes.toFixed(2)}
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Ticket Promedio</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">${stats.ticketPromedio.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-500">Productos Vendidos</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.productosVendidos}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Ventas por día */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Ventas por Día
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="ventas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ventas por categoría */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Ventas por Categoría
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ventasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {ventasPorCategoria.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-600">{cat.name} ({cat.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-800 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-3">
            {productosTop.map((p, i) => (
              <div key={p.nombre} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.nombre}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(p.cantidad / 45) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{p.cantidad} uds</p>
                  <p className="text-xs text-gray-500">${p.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
