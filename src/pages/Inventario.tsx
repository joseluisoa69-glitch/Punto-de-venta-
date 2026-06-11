import { useState } from 'react'
import { Package, AlertTriangle, TrendingDown, Plus, Minus, Search, ArrowLeft } from 'lucide-react'
import { useProductos } from '../hooks/useSupabase'
import { Link } from 'react-router-dom'

export default function Inventario() {
  const { productos, loading } = useProductos()
  const [busqueda, setBusqueda] = useState('')
  const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'agotado'>('todos')

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo_barras.includes(busqueda)
    if (filtroStock === 'bajo') return matchBusqueda && p.stock > 0 && p.stock <= p.stock_minimo
    if (filtroStock === 'agotado') return matchBusqueda && p.stock === 0
    return matchBusqueda
  })

  const stats = {
    total: productos.length,
    bajo: productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo).length,
    agotado: productos.filter(p => p.stock === 0).length,
    valor: productos.reduce((sum, p) => sum + (p.stock * p.precio_compra), 0)
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
            <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
            <p className="text-gray-500">Control de stock</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-500">Stock Bajo</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.bajo}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-500">Agotados</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.agotado}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-500">Valor Inv.</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${stats.valor.toFixed(2)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="input pl-12"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'bajo', 'agotado'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltroStock(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filtroStock === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'todos' ? 'Todos' : f === 'bajo' ? 'Stock Bajo' : 'Agotados'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Mínimo</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Ajustar</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-sm">{p.nombre}</p>
                      <p className="text-xs text-gray-500">{p.codigo_barras}</p>
                    </td>
                    <td className="p-3 text-right font-bold">{p.stock}</td>
                    <td className="p-3 text-right text-gray-500">{p.stock_minimo}</td>
                    <td className="p-3 text-right text-gray-600">${(p.stock * p.precio_compra).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      {p.stock === 0 ? (
                        <span className="badge bg-red-100 text-red-700">Agotado</span>
                      ) : p.stock <= p.stock_minimo ? (
                        <span className="badge bg-yellow-100 text-yellow-700">Bajo</span>
                      ) : (
                        <span className="badge bg-green-100 text-green-700">OK</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
