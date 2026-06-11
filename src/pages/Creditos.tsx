import { useState, useEffect } from 'react'
import { useClientes } from '../hooks/useSupabase'
import { Users, Plus, DollarSign, Save, X, ArrowLeft, UserPlus, CreditCard, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Creditos() {
  const { clientes, loading, cargarClientes, crearCliente, crearCredito, registrarAbono, cargarCreditos } = useClientes()
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false)
  const [mostrarNuevoCredito, setMostrarNuevoCredito] = useState(false)
  const [mostrarAbono, setMostrarAbono] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [creditoSeleccionado, setCreditoSeleccionado] = useState<any>(null)
  const [creditos, setCreditos] = useState<any[]>([])
  
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', direccion: '', limite_credito: '500' })
  const [nuevoCredito, setNuevoCredito] = useState({ total: '', descripcion: '' })
  const [nuevoAbono, setNuevoAbono] = useState({ monto: '', metodo_pago: 'efectivo', notas: '' })

  useEffect(() => {
    cargarCreditosList()
  }, [])

  const cargarCreditosList = async () => {
    const data = await cargarCreditos()
    setCreditos(data)
  }

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    try {
      await crearCliente({
        nombre: nuevoCliente.nombre,
        telefono: nuevoCliente.telefono,
        direccion: nuevoCliente.direccion,
        limite_credito: parseFloat(nuevoCliente.limite_credito) || 500
      })
      alert('Cliente creado exitosamente!')
      setMostrarNuevoCliente(false)
      setNuevoCliente({ nombre: '', telefono: '', direccion: '', limite_credito: '500' })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleCrearCredito = async () => {
    if (!nuevoCredito.total || parseFloat(nuevoCredito.total) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    if (!clienteSeleccionado) return
    try {
      await crearCredito({
        cliente_id: clienteSeleccionado.id,
        total: parseFloat(nuevoCredito.total),
        saldo_pendiente: parseFloat(nuevoCredito.total),
        items: nuevoCredito.descripcion
      })
      alert('Credito creado exitosamente!')
      setMostrarNuevoCredito(false)
      setNuevoCredito({ total: '', descripcion: '' })
      setClienteSeleccionado(null)
      cargarCreditosList()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleAbono = async () => {
    if (!nuevoAbono.monto || parseFloat(nuevoAbono.monto) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }
    if (!creditoSeleccionado) return
    try {
      await registrarAbono({
        credito_id: creditoSeleccionado.id,
        cliente_id: creditoSeleccionado.cliente_id,
        monto: parseFloat(nuevoAbono.monto),
        metodo_pago: nuevoAbono.metodo_pago,
        notas: nuevoAbono.notas
      })
      alert('Abono registrado!')
      setMostrarAbono(false)
      setNuevoAbono({ monto: '', metodo_pago: 'efectivo', notas: '' })
      setCreditoSeleccionado(null)
      cargarCreditosList()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const creditosActivos = creditos.filter(c => c.estado !== 'pagado')

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Creditos</h1>
              <p className="text-gray-500">Clientes y abonos</p>
            </div>
          </div>
          <button onClick={() => setMostrarNuevoCliente(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>

        {loading && <p className="text-center text-gray-500 mb-4">Cargando...</p>}

        {/* Clientes */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">Clientes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {clientes.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold">{c.nombre}</h3>
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {c.telefono || 'Sin telefono'}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {c.direccion || 'Sin direccion'}
                </p>
              </div>
              <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Limite: ${c.limite_credito}</span>
                <span className={`text-xs font-bold ${c.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Saldo: ${c.saldo_actual || 0}
                </span>
              </div>
              <button 
                onClick={() => { setClienteSeleccionado(c); setMostrarNuevoCredito(true) }}
                className="btn-warning w-full text-sm"
              >
                <CreditCard className="w-4 h-4" />
                Nueva Venta a Credito
              </button>
            </div>
          ))}
        </div>

        {clientes.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 mb-8">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay clientes registrados</p>
            <p className="text-sm">Click en "Nuevo Cliente" para agregar</p>
          </div>
        )}

        {/* Creditos Activos */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">Creditos Activos</h2>
        <div className="card overflow-hidden">
          {creditosActivos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay creditos activos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                    <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Pendiente</th>
                    <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-center p-3 text-xs font-semibold text-gray-500 uppercase">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {creditosActivos.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.clientes?.nombre || 'Cliente'}</td>
                      <td className="p-3 text-right">${(parseFloat(c.total) || 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-red-600">${(parseFloat(c.saldo_pendiente) || 0).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className={`badge ${
                          c.estado === 'pendiente' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => { setCreditoSeleccionado(c); setMostrarAbono(true) }}
                          className="btn-success text-xs py-1 px-2"
                        >
                          <DollarSign className="w-3 h-3" />
                          Abonar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Nuevo Cliente */}
        {mostrarNuevoCliente && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-4">Nuevo Cliente</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
                  <input type="text" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} placeholder="Ej: Juan Perez" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefono</label>
                  <input type="text" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} placeholder="555-1001" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Direccion</label>
                  <input type="text" value={nuevoCliente.direccion} onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} placeholder="Calle, Colonia" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Limite de credito</label>
                  <input type="number" value={nuevoCliente.limite_credito} onChange={(e) => setNuevoCliente({...nuevoCliente, limite_credito: e.target.value})} placeholder="500" className="input" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setMostrarNuevoCliente(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleCrearCliente} className="btn-primary flex-1">
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nuevo Credito */}
        {mostrarNuevoCredito && clienteSeleccionado && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-2">Venta a Credito</h2>
              <p className="text-gray-500 mb-4">Cliente: {clienteSeleccionado.nombre}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto total *</label>
                  <input type="number" value={nuevoCredito.total} onChange={(e) => setNuevoCredito({...nuevoCredito, total: e.target.value})} placeholder="0.00" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descripcion de la venta</label>
                  <textarea value={nuevoCredito.descripcion} onChange={(e) => setNuevoCredito({...nuevoCredito, descripcion: e.target.value})} placeholder="Que se le vendio..." className="input" rows={3} />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setMostrarNuevoCredito(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleCrearCredito} className="btn-warning flex-1">
                  <CreditCard className="w-4 h-4" />
                  Crear Credito
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Abono */}
        {mostrarAbono && creditoSeleccionado && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
              <h2 className="text-xl font-bold mb-2">Registrar Abono</h2>
              <p className="text-gray-500 mb-1">Cliente: {creditoSeleccionado.clientes?.nombre}</p>
              <p className="text-sm text-gray-400 mb-4">Saldo pendiente: ${(parseFloat(creditoSeleccionado.saldo_pendiente) || 0).toFixed(2)}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto del abono *</label>
                  <input type="number" value={nuevoAbono.monto} onChange={(e) => setNuevoAbono({...nuevoAbono, monto: e.target.value})} placeholder="0.00" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Metodo de pago</label>
                  <select value={nuevoAbono.metodo_pago} onChange={(e) => setNuevoAbono({...nuevoAbono, metodo_pago: e.target.value})} className="select">
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                  <input type="text" value={nuevoAbono.notas} onChange={(e) => setNuevoAbono({...nuevoAbono, notas: e.target.value})} placeholder="Opcional" className="input" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setMostrarAbono(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleAbono} className="btn-success flex-1">
                  <DollarSign className="w-4 h-4" />
                  Registrar Abono
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}