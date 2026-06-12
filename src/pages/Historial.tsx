import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, Search, Filter, ShoppingBag } from 'lucide-react'
import { useVentas } from '../hooks/useSupabase'
import { useClientes } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'

export default function Historial() {
  const { ventas, loading, cargarVentas } = useVentas()
  const { clientes } = useClientes()
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [creditos, setCreditos] = useState<any[]>([])

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    setFechaInicio(hoy); setFechaFin(hoy)
    cargarVentas(hoy, hoy)
    cargarCreditosHoy(hoy)
  }, [cargarVentas])

  const cargarCreditosHoy = async (fecha: string) => {
    const { data } = await supabase
      .from('creditos')
      .select('*, clientes(nombre)')
      .gte('created_at', fecha + 'T00:00:00')
      .lte('created_at', fecha + 'T23:59:59')
      .order('created_at', { ascending: false })
    setCreditos(data || [])
  }

  const handleFiltrar = () => {
    if (fechaInicio) {
      cargarVentas(fechaInicio, fechaFin || fechaInicio)
      cargarCreditosHoy(fechaInicio)
    }
  }

  const ventasFiltradas = ventas.filter((v: any) => {
    const matchMetodo = filtroMetodo === 'todos' || v.metodo_pago === filtroMetodo || (filtroMetodo === 'credito' && false)
    const matchBusqueda = !busqueda || v.venta_items?.some((item: any) => item.productos?.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    return matchMetodo && matchBusqueda
  })

  const creditosFiltrados = creditos.filter((c: any) => {
    if (filtroMetodo !== 'todos' && filtroMetodo !== 'credito') return false
    const matchBusqueda = !busqueda || c.clientes?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    return matchBusqueda
  })

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0)
  const totalEfectivo = ventasFiltradas.filter((v: any) => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0)
  const totalTarjeta = ventasFiltradas.filter((v: any) => v.metodo_pago === 'tarjeta').reduce((sum, v) => sum + v.total, 0)
  const totalTransferencia = ventasFiltradas.filter((v: any) => v.metodo_pago === 'transferencia').reduce((sum, v) => sum + v.total, 0)
  const totalCredito = creditosFiltrados.reduce((sum, c) => sum + (c.total || 0), 0)

  const formatearFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  const formatearHora = (fecha: string) => new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1><p className="text-gray-500">Ventas y creditos por fecha</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-500">Total Ventas</span></div><p className="text-xl font-bold text-gray-800">${totalVentas.toFixed(2)}</p></div>
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-500">Efectivo</span></div><p className="text-xl font-bold text-green-600">${totalEfectivo.toFixed(2)}</p></div>
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-500">Tarjeta/Transf</span></div><p className="text-xl font-bold text-purple-600">${(totalTarjeta + totalTransferencia).toFixed(2)}</p></div>
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-orange-600" /><span className="text-sm text-gray-500">Credito</span></div><p className="text-xl font-bold text-orange-600">${totalCredito.toFixed(2)}</p></div>
        </div>

        <div className="card p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Desde</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="input" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="input" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Metodo</label><select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)} className="select"><option value="todos">Todos</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option><option value="credito">Credito</option></select></div>
            <div className="flex items-end"><button onClick={handleFiltrar} className="btn-primary w-full"><Filter className="w-4 h-4" />Filtrar</button></div>
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por producto o cliente..." className="input pl-12" /></div>
        </div>

        <div className="space-y-3">
          {loading ? (<div className="text-center py-12 text-gray-400"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />Cargando...</div>)
           : (ventasFiltradas.length === 0 && creditosFiltrados.length === 0) ? (<div className="text-center py-12 text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No hay ventas en este periodo</p></div>)
           : (<>
             {ventasFiltradas.map((venta: any) => (
               <div key={venta.id} className="card p-4">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-blue-600" /></div>
                     <div>
                       <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm">{formatearFecha(venta.created_at)}</span><Clock className="w-4 h-4 text-gray-400 ml-2" /><span className="text-sm text-gray-500">{formatearHora(venta.created_at)}</span></div>
                       <span className="badge bg-gray-100 text-gray-600 mt-1 capitalize">{venta.metodo_pago}</span>
                     </div>
                   </div>
                   <div className="text-right"><p className="text-xl font-bold text-blue-600">${venta.total?.toFixed(2)}</p><p className="text-xs text-gray-500">{venta.venta_items?.length || 0} productos</p></div>
                 </div>
                 <div className="border-t pt-3 space-y-1">{venta.venta_items?.map((item: any, i: number) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{item.cantidad}x {item.productos?.nombre || 'Producto'}</span><span className="font-medium">${item.subtotal?.toFixed(2)}</span></div>))}</div>
                 <div className="flex justify-between items-center mt-3 pt-2 border-t text-sm"><span className="text-gray-500">Recibido: ${venta.recibido?.toFixed(2)}</span><span className="text-gray-500">Cambio: ${venta.cambio?.toFixed(2)}</span></div>
               </div>
             ))}
             {creditosFiltrados.map((cred: any) => (
               <div key={cred.id} className="card p-4 border-l-4 border-orange-500">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-orange-600" /></div>
                     <div>
                       <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm">{formatearFecha(cred.created_at)}</span><Clock className="w-4 h-4 text-gray-400 ml-2" /><span className="text-sm text-gray-500">{formatearHora(cred.created_at)}</span></div>
                       <span className="badge bg-orange-100 text-orange-700 mt-1">Credito - {cred.clientes?.nombre}</span>
                     </div>
                   </div>
                   <div className="text-right"><p className="text-xl font-bold text-orange-600">${cred.total?.toFixed(2)}</p><p className="text-xs text-gray-500">Pendiente: ${cred.saldo_pendiente?.toFixed(2)}</p></div>
                 </div>
               </div>
             ))}
           </>)}
        </div>
      </div>
    </div>
  )
}