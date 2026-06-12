import { useState, useRef } from 'react'
import { ScanLine, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, Check, X, Printer, Search, Package, Users } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { useProductos, useVentas, useClientes } from '../hooks/useSupabase'
import BarcodeScanner from '../components/BarcodeScanner'
import TecladoNumerico from '../components/TecladoNumerico'
import Ticket from '../components/Ticket'

export default function Venta() {
  const { carrito, agregarProducto, quitarProducto, actualizarCantidad, limpiarCarrito, totalCarrito, cantidadItems, escanerActivo, setEscanerActivo } = useStore()
  const { productos, buscarPorCodigo } = useProductos()
  const { registrarVenta } = useVentas()
  const { clientes, registrarCredito } = useClientes()

  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [mostrarTeclado, setMostrarTeclado] = useState(false)
  const [productoTeclado, setProductoTeclado] = useState(null)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [recibido, setRecibido] = useState(0)
  const [cambio, setCambio] = useState(0)
  const [clienteCredito, setClienteCredito] = useState('')
  const [mostrarTicket, setMostrarTicket] = useState(false)
  const [ventaOk, setVentaOk] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const ticketRef = useRef(null)
  const busquedaRef = useRef(null)
  const total = totalCarrito()

  const handleBusqueda = (query) => {
    setBusqueda(query)
    if (query.length > 1) {
      setResultados(productos.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase()) || p.codigo_barras.includes(query)).slice(0, 10))
    } else { setResultados([]) }
  }

  const handleScan = async (codigo) => {
    const producto = await buscarPorCodigo(codigo)
    if (producto) { agregarProducto(producto); setBusqueda('') }
    else { setMensaje('Producto no encontrado: ' + codigo); setTimeout(() => setMensaje(''), 3000) }
  }

  const agregarDesdeBusqueda = (producto) => { agregarProducto(producto); setBusqueda(''); setResultados([]); busquedaRef.current?.focus() }
  const abrirTeclado = (producto) => { setProductoTeclado(producto); setMostrarTeclado(true) }
  const confirmarCantidad = (cantidad) => { if (productoTeclado) agregarProducto(productoTeclado, cantidad); setMostrarTeclado(false); setProductoTeclado(null) }
  const calcularCambio = (monto) => { setRecibido(monto); setCambio(Math.max(0, monto - total)) }

  const procesarVenta = async () => {
    if (carrito.length === 0) return
    if (metodoPago === 'credito' && !clienteCredito) { alert('Selecciona un cliente para el credito'); return }
    setProcesando(true)
    try {
      if (metodoPago === 'credito') {
        await registrarCredito(clienteCredito, carrito, total)
        setMensaje('Credito registrado correctamente'); setTimeout(() => setMensaje(''), 4000)
      } else {
        await registrarVenta(carrito, total, metodoPago, recibido, cambio)
        setVentaOk({ items: carrito, total, recibido, cambio, metodoPago, fecha: new Date().toLocaleString('es-MX') })
        setMostrarTicket(true)
      }
      setMostrarPago(false); limpiarCarrito(); setRecibido(0); setCambio(0); setClienteCredito(''); setMetodoPago('efectivo')
    } catch (err) { alert('Error: ' + err.message) }
    finally { setProcesando(false) }
  }

  const imprimirTicket = () => {
    const ventana = window.open('', '_blank')
    if (ventana && ticketRef.current) {
      ventana.document.write('<html><head><title>Ticket</title></head><body style="margin:0;padding:20px;display:flex;justify-content:center;">' + ticketRef.current.outerHTML + '</body></html>')
      ventana.document.close(); ventana.print()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {mensaje && <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white p-3 rounded-xl shadow-lg text-center font-bold">{mensaje}</div>}
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 bg-white border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input ref={busquedaRef} type="text" value={busqueda} onChange={(e) => handleBusqueda(e.target.value)} placeholder="Buscar producto o escanear..." className="input pl-12" />
              <button onClick={() => setEscanerActivo(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><ScanLine className="w-5 h-5" /></button>
            </div>
            {resultados.length > 0 && (
              <div className="absolute z-20 left-3 right-3 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto">
                {resultados.map(p => (
                  <button key={p.id} onClick={() => agregarDesdeBusqueda(p)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left">
                    <Package className="w-8 h-8 text-gray-400" /><div className="flex-1"><p className="font-medium text-sm">{p.nombre}</p><p className="text-xs text-gray-500">{p.codigo_barras}</p></div>
                    <div className="text-right"><p className="font-bold text-blue-600">${p.precio_venta.toFixed(2)}</p><p className="text-xs text-gray-500">Stock: {p.stock}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Productos Frecuentes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {productos.slice(0, 20).map(p => (
                <button key={p.id} onClick={() => agregarProducto(p)} onContextMenu={(e) => { e.preventDefault(); abrirTeclado(p) }} className="card p-2 text-left hover:shadow-md transition-all active:scale-95">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-1"><Package className="w-5 h-5 text-blue-600" /></div>
                  <p className="font-medium text-xs line-clamp-2">{p.nombre}</p><p className="text-base font-bold text-blue-600 mt-0.5">${p.precio_venta.toFixed(2)}</p><p className="text-[10px] text-gray-400">Stock: {p.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-white border-l flex flex-col shrink-0">
          <div className="p-3 border-b bg-gray-50 shrink-0"><div className="flex items-center gap-2 text-gray-700"><ShoppingCart className="w-5 h-5" /><h2 className="font-bold">Carrito</h2><span className="badge bg-blue-100 text-blue-700">{cantidadItems()}</span></div></div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {carrito.length === 0 ? (
              <div className="text-center py-8 text-gray-400"><ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Carrito vacio</p><p className="text-xs">Escanee o busque productos</p></div>
            ) : (
              carrito.map((item) => (
                <div key={item.producto_id} className="card p-2">
                  <div className="flex items-start justify-between mb-1"><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.producto?.nombre}</p><p className="text-xs text-gray-500">${item.precio_unitario.toFixed(2)} c/u</p></div><button onClick={() => quitarProducto(item.producto_id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-4 h-4" /></button></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-1"><button onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button><span className="w-8 text-center font-bold text-sm">{item.cantidad}</span><button onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button></div><span className="font-bold text-blue-600 text-sm">${item.subtotal.toFixed(2)}</span></div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t bg-gray-50 shrink-0">
            <div className="flex justify-between items-center mb-2"><span className="text-gray-600 text-sm">Total</span><span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { limpiarCarrito(); setRecibido(0); setCambio(0); }} className="btn-outline py-2 text-sm" disabled={carrito.length === 0}><X className="w-4 h-4" />Cancelar</button>
              <button onClick={() => setMostrarPago(true)} className="btn-success py-2 text-sm" disabled={carrito.length === 0}><Check className="w-4 h-4" />Cobrar</button>
            </div>
          </div>
        </div>
      </div>

      {escanerActivo && <BarcodeScanner onScan={handleScan} onClose={() => setEscanerActivo(false)} />}
      <TecladoNumerico visible={mostrarTeclado} titulo={`Cantidad: ${productoTeclado?.nombre || ''}`} onConfirmar={confirmarCantidad} onCancelar={() => setMostrarTeclado(false)} />

      {mostrarPago && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Procesar pago</h2>
            <div className="text-center mb-4"><p className="text-gray-500 text-sm">Total a pagar</p><p className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</p></div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[{ id: 'efectivo', icon: Banknote, label: 'Efectivo' },{ id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },{ id: 'transferencia', icon: Smartphone, label: 'Transfer' },{ id: 'credito', icon: Users, label: 'Credito' }].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setMetodoPago(id)} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${metodoPago === id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}><Icon className="w-5 h-5" /><span className="text-xs font-medium">{label}</span></button>
              ))}
            </div>

            {metodoPago === 'efectivo' && (
              <div className="space-y-3 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Recibido</label><input type="number" value={recibido || ''} onChange={(e) => calcularCambio(parseFloat(e.target.value) || 0)} className="input text-lg font-bold" placeholder="0.00" autoFocus /></div>
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl"><span className="text-gray-600">Cambio</span><span className={`text-xl font-bold ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>${cambio.toFixed(2)}</span></div>
              </div>
            )}

            {metodoPago === 'credito' && (
              <div className="space-y-3 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select value={clienteCredito} onChange={(e) => setClienteCredito(e.target.value)} className="select" required>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (<option key={c.id} value={c.id}>{c.nombre} (Limite: ${c.limite_credito?.toFixed(2)} - Saldo: ${c.saldo_actual?.toFixed(2)})</option>))}
                  </select>
                </div>
                {clienteCredito && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800"><p>Se registrara un credito por <strong>${total.toFixed(2)}</strong></p><p className="text-xs mt-1">El stock se descontara automaticamente.</p></div>}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setMostrarPago(false)} className="btn-outline flex-1"><X className="w-4 h-4" />Cancelar</button>
              <button onClick={procesarVenta} disabled={procesando || (metodoPago === 'efectivo' && cambio < 0) || (metodoPago === 'credito' && !clienteCredito)} className="btn-success flex-1">
                {procesando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" />{metodoPago === 'credito' ? 'Registrar Credito' : 'Confirmar'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarTicket && ventaOk && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 animate-slide-up">
            <div className="text-center mb-4"><div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><Check className="w-7 h-7 text-green-600" /></div><h2 className="text-xl font-bold text-gray-800">Venta Exitosa!</h2></div>
            <div className="hidden"><Ticket ref={ticketRef} items={ventaOk.items} total={ventaOk.total} recibido={ventaOk.recibido} cambio={ventaOk.cambio} metodoPago={ventaOk.metodoPago} fecha={ventaOk.fecha} /></div>
            <div className="space-y-2">
              <button onClick={imprimirTicket} className="btn-primary w-full"><Printer className="w-5 h-5" />Imprimir Ticket</button>
              <button onClick={() => { setMostrarTicket(false); setVentaOk(null); }} className="btn-outline w-full">Nueva Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}