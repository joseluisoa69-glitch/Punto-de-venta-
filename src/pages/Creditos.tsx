import { useState, useEffect } from 'react'
import { Users, Plus, Search, DollarSign, Save, X, ArrowLeft, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useClientes } from '../hooks/useSupabase'
import { Link } from 'react-router-dom'

export default function Creditos() {
  const { clientes, loading, cargarClientes, crearCliente, cargarCreditos, registrarAbono } = useClientes()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarAbono, setMostrarAbono] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [creditos, setCreditos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')

  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', direccion: '', limite_credito: '' })
  const [abonoData, setAbonoData] = useState({ monto: '' })

  useEffect(() => {
    cargarClientes()
  }, [cargarClientes])

  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearCliente({
        ...nuevoCliente,
        limite_credito: parseFloat(nuevoCliente.limite_credito) || 0
      })
      setMostrarForm(false)
      setNuevoCliente({ nombre: '', telefono: '', direccion: '', limite_credito: '' })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const verCreditos = async (cliente: any) => {
    setClienteSeleccionado(cliente)
    const data = await cargarCreditos(cliente.id)
    setCreditos(data)
  }

  const handleAbono = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado || !abonoData.monto) return
    try {
      const creditoPendiente = creditos.find(c => c.estado !== 'pagado')
      if (!creditoPendiente) {
        alert('No hay creditos pendientes')
        return
      }
      await registrarAbono(creditoPendiente.id, clienteSeleccionado.id, parseFloat(abonoData.monto))
      setMostrarAbono(false)
      setAbonoData({ monto: '' })
      // Recargar
      const data = await cargarCreditos(clienteSeleccionado.id)
      setCreditos(data)
      await cargarClientes()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  )

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'pagado': return 'bg-green-100 text-green-700'
      case 'parcial': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-red-100 text-red-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Creditos</h1>
              <p className="text-gray-500">Clientes y abonos</p>
            </div>
          </div>
          <button onClick={() => setMostrarForm(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>

        {/* Busqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
            className="input pl-12"
          />
        </div>

        {/* Lista de clientes */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay clientes registrados</p>
            </div>
          ) : (
            clientesFiltrados.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{c.nombre}</h3>
                      <p className="text-sm text-gray-500">{c.telefono || 'Sin telefono'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">Limite: ${c.limite_credito?.toFixed(2)}</span>
                        <span className={`badge text-xs ${c.saldo_actual > c.limite_credito ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          Saldo: ${c.saldo_actual?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setClienteSeleccionado(c); setMostrarAbono(true); }}
                      className="btn-success text-sm"
                      disabled={c.saldo_actual <= 0}
                    >
                      <DollarSign className="w-4 h-4" />
                      Abonar
                    </button>
                    <button 
                      onClick={() => verCreditos(c)}
                      className="btn-outline text-sm"
                    >
                      <Clock className="w-4 h-4" />
                      Creditos
                    </button>
                  </div>
                </div>

                {/* Creditos del cliente */}
                {clienteSeleccionado?.id === c.id && creditos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Historial de Creditos</h4>
                    <div className="space-y-2">
                      {creditos.map((credito: any) => (
                        <div key={credito.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(credito.created_at).toLocaleDateString('es-MX')}
                              </p>
                              <span className={`badge text-xs mt-1 ${getEstadoColor(credito.estado)}`}>
                                {credito.estado}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">Total: ${credito.total?.toFixed(2)}</p>
                              <p className="text-sm text-red-600">Pendiente: ${credito.saldo_pendiente?.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {/* Items del credito */}
                          {credito.items && (
                            <div className="text-xs text-gray-500 mt-2">
                              {(() => {
                                try {
                                  const items = JSON.parse(credito.items)
                                  return items.map((item: any, i: number) => (
                                    <span key={i} className="inline-block mr-2">
                                      {item.cantidad}x {item.producto?.nombre || 'Producto'}
                                    </span>
                                  ))
                                } catch (e) { return null }
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Nuevo Cliente */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Cliente</h2>
              <button onClick={() => setMostrarForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCrearCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="text"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
                <input
                  type="text"
                  value={nuevoCliente.direccion}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Credito</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoCliente.limite_credito}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, limite_credito: e.target.value})}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
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

      {/* Modal Abono */}
      {mostrarAbono && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Abono - {clienteSeleccionado.nombre}</h2>
              <button onClick={() => setMostrarAbono(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-xl mb-4">
              <p className="text-sm text-blue-800">Saldo actual: <span className="font-bold">${clienteSeleccionado.saldo_actual?.toFixed(2)}</span></p>
              <p className="text-sm text-blue-800">Limite: <span className="font-bold">${clienteSeleccionado.limite_credito?.toFixed(2)}</span></p>
            </div>

            <form onSubmit={handleAbono} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a abonar *</label>
                <input
                  type="number"
                  step="0.01"
                  value={abonoData.monto}
                  onChange={(e) => setAbonoData({...abonoData, monto: e.target.value})}
                  className="input text-lg font-bold"
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMostrarAbono(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-success flex-1">
                  <CheckCircle className="w-4 h-4" />
                  Registrar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}