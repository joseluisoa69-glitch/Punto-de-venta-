import { useState } from 'react'
import { useProveedores } from '../hooks/useSupabase'
import { Truck, Plus, DollarSign, Save, X, ArrowLeft, Receipt, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Proveedores() {
  const { proveedores, loading, crearProveedor, registrarPago } = useProveedores()
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any>(null)
  
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', telefono: '', direccion: '', notas: '' })
  const [nuevoPago, setNuevoPago] = useState({ monto: '', concepto: '', metodo_pago: 'efectivo' })

  const handleCrearProveedor = async () => {
    if (!nuevoProveedor.nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    try {
      await crearProveedor(nuevoProveedor)
      alert('Proveedor creado exitosamente!')
      setMostrarNuevo(false)
      setNuevoProveedor({ nombre: '', telefono: '', direccion: '', notas: '' })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleRegistrarPago = async () => {
    if (!nuevoPago.monto || parseFloat(nuevoPago.monto) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    if (!proveedorSeleccionado) return
    try {
      await registrarPago({
        proveedor_id: proveedorSeleccionado.id,
        monto: parseFloat(nuevoPago.monto),
        concepto: nuevoPago.concepto,
        metodo_pago: nuevoPago.metodo_pago
      })
      alert('Pago registrado exitosamente!')
      setMostrarPago(false)
      setNuevoPago({ monto: '', concepto: '', metodo_pago: 'efectivo' })
      setProveedorSeleccionado(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
              <p className="text-gray-500">Gestiona proveedores y pagos</p>
            </div>
          </div>
          <button onClick={() => setMostrarNuevo(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>

        {loading && <p className="text-center text-gray-500 mb-4">Cargando...</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">{p.nombre}</h3>
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {p.telefono || 'Sin telefono'}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {p.direccion || 'Sin direccion'}
                </p>
                {p.notas && <p className="text-xs text-gray-400 mt-2">{p.notas}</p>}
              </div>
              <button 
                onClick={() => { setProveedorSeleccionado(p); setMostrarPago(true) }}
                className="btn-success w-full text-sm"
              >
                <DollarSign className="w-4 h-4" />
                Registrar Pago
              </button>
            </div>
          ))}
        </div>

        {proveedores.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay proveedores registrados</p>
            <p className="text-sm">Click en "Nuevo Proveedor" para agregar</p>
          </div>
        )}

        {/* Modal Nuevo Proveedor */}
        {mostrarNuevo && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Nuevo Proveedor</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input type="text" value={nuevoProveedor.nombre} onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})} placeholder="Ej: Coca Cola FEMSA" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefono</label>
                  <input type="text" value={nuevoProveedor.telefono} onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})} placeholder="555-0101" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Direccion</label>
                  <input type="text" value={nuevoProveedor.direccion} onChange={(e) => setNuevoProveedor({...nuevoProveedor, direccion: e.target.value})} placeholder="Toluca, Edomex" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                  <textarea value={nuevoProveedor.notas} onChange={(e) => setNuevoProveedor({...nuevoProveedor, notas: e.target.value})} placeholder="Notas adicionales..." className="input" rows={2} />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setMostrarNuevo(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleCrearProveedor} className="btn-primary flex-1">
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Pago */}
        {mostrarPago && proveedorSeleccionado && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-2">Pago a Proveedor</h2>
              <p className="text-gray-500 mb-4">{proveedorSeleccionado.nombre}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto *</label>
                  <input type="number" value={nuevoPago.monto} onChange={(e) => setNuevoPago({...nuevoPago, monto: e.target.value})} placeholder="0.00" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                  <input type="text" value={nuevoPago.concepto} onChange={(e) => setNuevoPago({...nuevoPago, concepto: e.target.value})} placeholder="Pago de mercancia" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Metodo de Pago</label>
                  <select value={nuevoPago.metodo_pago} onChange={(e) => setNuevoPago({...nuevoPago, metodo_pago: e.target.value})} className="select">
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setMostrarPago(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleRegistrarPago} className="btn-success flex-1">
                  <Receipt className="w-4 h-4" />
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}