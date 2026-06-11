import { useState } from 'react'
import { useVentas } from '../hooks/useSupabase'
import { Calendar, Search, DollarSign, Clock, Filter, ArrowLeft, Receipt } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Historial() {
  const { cargarVentasPorFecha } = useVentas()
  const [ventas, setVentas] = useState<any[]>([])
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0])
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await cargarVentasPorFecha(fechaInicio, fechaFin)
      setVentas(data)
      if (data.length === 0) {
        alert('No hay ventas en este periodo')
      }
    } catch (err: any) {
      alert('Error cargando ventas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const ventasFiltradas = ventas.filter(v => {
    const matchMetodo = filtroMetodo === 'todos' || v.metodo_pago === filtroMetodo
    const matchBusqueda = !busqueda || v.id.toString().includes(busqueda)
    return matchMetodo && matchBusqueda
  })

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)
  const totalEfectivo = ventasFiltradas.filter(v => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)
  const totalTarjeta = ventasFiltradas.filter(v => v.metodo_pago === 'tarjeta').reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatearHora = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1>
            <p className="text-gray-500">Filtra por fecha, hora y metodo de pago</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <DollarSign className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">${totalVentas.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="card p-4">
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold">${totalEfectivo.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Efectivo</p>
          </div>
          <div className="card p-4">
            <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">${totalTarjeta.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Tarjeta</p>
          </div>
        </div>

        <div className="card mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Inicio</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Fin</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Metodo de Pago</label>
              <select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)} className="select">
                <option value="todos">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={cargar} className="btn-primary w-full" disabled={loading}>
                {loading ? 'Cargando...' : <><Filter className="w-4 h-4" /> Filtrar</>}
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por folio..." className="input pl-10" />
          </div>
        </div>

        <div className="card overflow-hidden">
          {ventasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay ventas en este periodo</p>
              <p className="text-sm">Selecciona fechas y presiona Filtrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Folio</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Hora</th>
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Metodo</th>
                    <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map(v => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-600">{v.id.slice(0, 8)}</td>
                      <td className="p-3 text-sm">{formatearFecha(v.created_at)}</td>
                      <td className="p-3 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatearHora(v.created_at)}
                      </td>
                      <td className="p-3">
                        <span className={`badge ${
                          v.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' :
                          v.metodo_pago === 'tarjeta' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {v.metodo_pago}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold">${(parseFloat(v.total) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}