import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, Wallet, CreditCard, Users, PiggyBank } from 'lucide-react'
import { useVentas } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'

export default function Reportes() {
  const { cargarVentas } = useVentas()
  const [fecha, setFecha] = useState('')
  const [ventasDia, setVentasDia] = useState<any[]>([])
  const [creditosDia, setCreditosDia] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    setFecha(hoy)
    cargarDatos(hoy)
  }, [])

  const cargarDatos = async (f: string) => {
    setLoading(true)
    try {
      // Ventas del dia
      const { data: v } = await supabase
        .from('ventas')
        .select('*, venta_items(*, productos(precio_compra, precio_venta))')
        .gte('created_at', f + 'T00:00:00')
        .lte('created_at', f + 'T23:59:59')
        .order('created_at', { ascending: false })
      setVentasDia(v || [])

      // Creditos del dia
      const { data: c } = await supabase
        .from('creditos')
        .select('*, clientes(nombre)')
        .gte('created_at', f + 'T00:00:00')
        .lte('created_at', f + 'T23:59:59')
      setCreditosDia(c || [])

      // Productos para calcular ganancia
      const { data: p } = await supabase.from('productos').select('*').eq('activo', true)
      setProductos(p || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleFiltrar = () => { if (fecha) cargarDatos(fecha) }

  // CALCULOS CORTE DE CAJA
  const totalEfectivo = ventasDia.filter((v: any) => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0)
  const totalTarjeta = ventasDia.filter((v: any) => v.metodo_pago === 'tarjeta').reduce((sum, v) => sum + v.total, 0)
  const totalTransferencia = ventasDia.filter((v: any) => v.metodo_pago === 'transferencia').reduce((sum, v) => sum + v.total, 0)
  const totalCredito = creditosDia.reduce((sum, c) => sum + c.total, 0)
  const totalVentas = ventasDia.reduce((sum, v) => sum + v.total, 0)

  // GANANCIA REAL (venta - costo)
  let ganancia = 0
  ventasDia.forEach((v: any) => {
    v.venta_items?.forEach((item: any) => {
      const costo = item.productos?.precio_compra || 0
      const venta = item.precio_unitario || 0
      ganancia += (venta - costo) * item.cantidad
    })
  })

  const numVentas = ventasDia.length
  const ticketPromedio = numVentas > 0 ? totalVentas / numVentas : 0
  const productosVendidos = ventasDia.reduce((sum, v) => sum + (v.venta_items?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Reportes y Corte de Caja</h1><p className="text-gray-500">Analisis de ventas reales</p></div>

        {/* Selector de fecha */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full"><label className="block text-xs font-medium text-gray-500 mb-1">Fecha del corte</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" /></div>
          <button onClick={handleFiltrar} className="btn-primary w-full sm:w-auto"><Calendar className="w-4 h-4" />Ver Corte</button>
        </div>

        {/* CORTE DE CAJA */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-600" />Corte de Caja - {fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="card p-4 bg-green-50 border-green-200"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-600">Efectivo</span></div><p className="text-2xl font-bold text-green-700">${totalEfectivo.toFixed(2)}</p></div>
            <div className="card p-4 bg-purple-50 border-purple-200"><div className="flex items-center gap-2 mb-2"><CreditCard className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-600">Tarjeta</span></div><p className="text-2xl font-bold text-purple-700">${totalTarjeta.toFixed(2)}</p></div>
            <div className="card p-4 bg-blue-50 border-blue-200"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-600">Transferencia</span></div><p className="text-2xl font-bold text-blue-700">${totalTransferencia.toFixed(2)}</p></div>
            <div className="card p-4 bg-orange-50 border-orange-200"><div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-orange-600" /><span className="text-sm text-gray-600">Credito</span></div><p className="text-2xl font-bold text-orange-700">${totalCredito.toFixed(2)}</p></div>
            <div className="card p-4 bg-yellow-50 border-yellow-200"><div className="flex items-center gap-2 mb-2"><PiggyBank className="w-5 h-5 text-yellow-600" /><span className="text-sm text-gray-600">Ganancia Real</span></div><p className="text-2xl font-bold text-yellow-700">${ganancia.toFixed(2)}</p></div>
            <div className="card p-4 bg-slate-50 border-slate-200"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-slate-600" /><span className="text-sm text-gray-600">Total del Dia</span></div><p className="text-2xl font-bold text-slate-800">${(totalVentas + totalCredito).toFixed(2)}</p></div>
          </div>
        </div>

        {/* Stats adicionales */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-500">Num. Ventas</span></div><p className="text-xl font-bold text-gray-800">{numVentas}</p></div>
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-500">Ticket Promedio</span></div><p className="text-xl font-bold text-gray-800">${ticketPromedio.toFixed(2)}</p></div>
          <div className="card p-4"><div className="flex items-center gap-2 mb-2"><Package className="w-5 h-5 text-blue-600" /><span className="text-sm text-gray-500">Productos Vendidos</span></div><p className="text-xl font-bold text-gray-800">{productosVendidos}</p></div>
        </div>

        {/* Detalle de ventas del dia */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-800 mb-4">Detalle del Dia</h3>
          {loading ? (<div className="text-center py-8 text-gray-400">Cargando...</div>)
           : ventasDia.length === 0 && creditosDia.length === 0 ? (<div className="text-center py-8 text-gray-400">No hay movimientos este dia</div>)
           : (<div className="space-y-2">
             {ventasDia.map((v: any) => (
               <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                 <div><p className="font-medium text-sm">{new Date(v.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - <span className="capitalize">{v.metodo_pago}</span></p><p className="text-xs text-gray-500">{v.venta_items?.length || 0} productos</p></div>
                 <span className="font-bold text-blue-600">${v.total?.toFixed(2)}</span>
               </div>
             ))}
             {creditosDia.map((c: any) => (
               <div key={c.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                 <div><p className="font-medium text-sm">{new Date(c.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - <span className="text-orange-600">Credito</span></p><p className="text-xs text-gray-500">{c.clientes?.nombre}</p></div>
                 <span className="font-bold text-orange-600">${c.total?.toFixed(2)}</span>
               </div>
             ))}
           </div>)}
        </div>
      </div>
    </div>
  )
}