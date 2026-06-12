import { useState } from 'react'
import { Truck, Plus, Search, DollarSign, Save, X, History } from 'lucide-react'
import { useProveedores } from '../hooks/useSupabase'

export default function Proveedores() {
  const { proveedores, loading, crearProveedor, registrarPago, cargarPagos } = useProveedores()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [proveedorSel, setProveedorSel] = useState<any>(null)
  const [pagos, setPagos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')

  const [nuevo, setNuevo] = useState({ nombre: '', telefono: '', direccion: '', notas: '' })
  const [pagoData, setPagoData] = useState({ monto: '', concepto: '', metodo_pago: 'efectivo' })

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await crearProveedor(nuevo); setMostrarForm(false); setNuevo({ nombre: '', telefono: '', direccion: '', notas: '' }) }
    catch (err: any) { alert('Error: ' + err.message) }
  }

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proveedorSel) return
    try {
      await registrarPago({ proveedor_id: proveedorSel.id, monto: parseFloat(pagoData.monto), concepto: pagoData.concepto, metodo_pago: pagoData.metodo_pago })
      setMostrarPago(false); setPagoData({ monto: '', concepto: '', metodo_pago: 'efectivo' })
      const nuevosPagos = await cargarPagos(proveedorSel.id); setPagos(nuevosPagos)
    } catch (err: any) { alert('Error: ' + err.message) }
  }

  const verPagos = async (p: any) => { setProveedorSel(p); const data = await cargarPagos(p.id); setPagos(data) }

  const filtrados = proveedores.filter((p: any) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.telefono?.includes(busqueda))

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-800">Proveedores</h1><p className="text-gray-500">Pagos y gestion</p></div>
          <button onClick={() => setMostrarForm(true)} className="btn-primary"><Plus className="w-5 h-5" />Nuevo</button>
        </div>
        <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="input pl-12" /></div>

        <div className="grid gap-3">
          {loading ? (<div className="text-center py-12 text-gray-400">Cargando...</div>)
           : filtrados.length === 0 ? (<div className="text-center py-12 text-gray-400"><Truck className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No hay proveedores</p></div>)
           : filtrados.map((p: any) => (
             <div key={p.id} className="card p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><Truck className="w-6 h-6 text-orange-600" /></div>
                   <div><h3 className="font-bold text-gray-800">{p.nombre}</h3><p className="text-sm text-gray-500">{p.telefono || 'Sin telefono'}</p><p className="text-xs text-gray-400">{p.direccion}</p></div>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => { setProveedorSel(p); setMostrarPago(true); }} className="btn-success text-sm"><DollarSign className="w-4 h-4" />Pagar</button>
                   <button onClick={() => verPagos(p)} className="btn-outline text-sm"><History className="w-4 h-4" />Historial</button>
                 </div>
               </div>
               {proveedorSel?.id === p.id && pagos.length > 0 && (
                 <div className="mt-4 pt-4 border-t">
                   <h4 className="font-semibold text-sm text-gray-700 mb-2">Historial de Pagos</h4>
                   <div className="space-y-2">{pagos.map((pago: any) => (<div key={pago.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div><p className="font-medium text-sm">{pago.concepto || 'Pago'}</p><p className="text-xs text-gray-500">{new Date(pago.created_at).toLocaleDateString('es-MX')}</p></div><span className="font-bold text-green-600">${pago.monto?.toFixed(2)}</span></div>))}</div>
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Nuevo Proveedor</h2><button onClick={() => setMostrarForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCrear} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input type="text" value={nuevo.nombre} onChange={(e) => setNuevo({...nuevo, nombre: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label><input type="text" value={nuevo.telefono} onChange={(e) => setNuevo({...nuevo, telefono: e.target.value})} className="input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label><input type="text" value={nuevo.direccion} onChange={(e) => setNuevo({...nuevo, direccion: e.target.value})} className="input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Notas</label><textarea value={nuevo.notas} onChange={(e) => setNuevo({...nuevo, notas: e.target.value})} className="input h-20 resize-none" /></div>
              <div className="flex gap-2"><button type="button" onClick={() => setMostrarForm(false)} className="btn-outline flex-1">Cancelar</button><button type="submit" className="btn-primary flex-1"><Save className="w-4 h-4" />Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {mostrarPago && proveedorSel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Pago a {proveedorSel.nombre}</h2><button onClick={() => setMostrarPago(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handlePago} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label><input type="number" step="0.01" value={pagoData.monto} onChange={(e) => setPagoData({...pagoData, monto: e.target.value})} className="input text-lg font-bold" placeholder="0.00" required autoFocus /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label><input type="text" value={pagoData.concepto} onChange={(e) => setPagoData({...pagoData, concepto: e.target.value})} className="input" placeholder="Ej: Pedido #123" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Metodo</label><select value={pagoData.metodo_pago} onChange={(e) => setPagoData({...pagoData, metodo_pago: e.target.value})} className="select"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="cheque">Cheque</option></select></div>
              <div className="flex gap-2"><button type="button" onClick={() => setMostrarPago(false)} className="btn-outline flex-1">Cancelar</button><button type="submit" className="btn-success flex-1"><DollarSign className="w-4 h-4" />Registrar Pago</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}