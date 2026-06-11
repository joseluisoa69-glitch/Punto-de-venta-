import { useState } from 'react'
import { Plus, Search, Package, Edit, Trash2, Save, X } from 'lucide-react'
import { useProductos } from '../hooks/useSupabase'
import type { Producto } from '../types'

export default function Productos() {
  const { productos, loading, crearProducto } = useProductos()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const [nuevoProducto, setNuevoProducto] = useState({
    codigo_barras: '',
    nombre: '',
    precio_venta: 0,
    precio_compra: 0,
    stock: 0,
    stock_minimo: 5,
    categoria: 'general',
    unidad: 'pz',
    activo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearProducto(nuevoProducto)
      setMostrarForm(false)
      setNuevoProducto({
        codigo_barras: '',
        nombre: '',
        precio_venta: 0,
        precio_compra: 0,
        stock: 0,
        stock_minimo: 5,
        categoria: 'general',
        unidad: 'pz',
        activo: true
      })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_barras.includes(busqueda)
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-500">Gestión de inventario</p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="input pl-12"
          />
        </div>

        {/* Lista de productos */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Precio</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.nombre}</p>
                          <p className="text-xs text-gray-500">{p.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600 font-mono">{p.codigo_barras}</td>
                    <td className="p-3 text-right font-bold text-blue-600">${p.precio_venta.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${p.stock <= p.stock_minimo ? 'text-red-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`badge ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Nuevo Producto */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Producto</h2>
              <button onClick={() => setMostrarForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={nuevoProducto.codigo_barras}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })}
                    className="input"
                    placeholder="Escanea o escribe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                    className="input"
                    placeholder="Nombre del producto"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProducto.precio_venta || ''}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_venta: parseFloat(e.target.value) })}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProducto.precio_compra || ''}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_compra: parseFloat(e.target.value) })}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={nuevoProducto.stock || ''}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: parseInt(e.target.value) })}
                    className="input"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={nuevoProducto.stock_minimo || ''}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock_minimo: parseInt(e.target.value) })}
                    className="input"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select
                    value={nuevoProducto.unidad}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, unidad: e.target.value })}
                    className="select"
                  >
                    <option value="pz">Pieza</option>
                    <option value="kg">Kilogramo</option>
                    <option value="lt">Litro</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={nuevoProducto.categoria}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                  className="select"
                >
                  <option value="general">General</option>
                  <option value="bebidas">Bebidas</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="dulces">Dulces</option>
                  <option value="cigarros">Cigarros</option>
                  <option value="cerveza">Cerveza</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setMostrarForm(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
