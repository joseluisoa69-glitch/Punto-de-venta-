import { useState, useRef, useCallback } from 'react'
import { 
  ScanLine, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, Banknote, Smartphone, Check, X, Printer,
  Search, Package, Store, ScanBarcode, Users
} from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { useProductos, useVentas, useClientes } from '../hooks/useSupabase'
import BarcodeScanner from '../components/BarcodeScanner'
import TecladoNumerico from '../components/TecladoNumerico'
import Ticket from '../components/Ticket'
import type { Producto } from '../types'

export default function Venta() {
  const {
    carrito, agregarProducto, quitarProducto, actualizarCantidad,
    limpiarCarrito, totalCarrito, cantidadItems,
    escanerActivo, setEscanerActivo
  } = useStore()

  const { productos, buscarPorCodigo } = useProductos()
  const { registrarVenta, registrarVentaCredito } = useVentas()
  const { clientes } = useClientes()

  const [busqueda, setBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Producto[]>([])
  const [mostrarTeclado, setMostrarTeclado] = useState(false)
  const [productoTeclado, setProductoTeclado] = useState<Producto | null>(null)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'credito'>('efectivo')
  const [recibido, setRecibido] = useState(0)
  const [cambio, setCambio] = useState(0)
  const [mostrarTicket, setMostrarTicket] = useState(false)
  const [ventaCompletada, setVentaCompletada] = useState<any>(null)
  const [procesando, setProcesando] = useState(false)
  const [ultimoEscaneado, setUltimoEscaneado] = useState<string>('')
  const [clienteCredito, setClienteCredito] = useState<any>(null)
  const [mostrarSelectorCliente, setMostrarSelectorCliente] = useState(false)

  const ticketRef = useRef<HTMLDivElement>(null)
  const busquedaRef = useRef<HTMLInputElement>(null)

  const total = totalCarrito()

  const handleBusqueda = (query: string) => {
    setBusqueda(query)
    if (query.length > 1) {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.codigo_barras.includes(query)
      ).slice(0, 10)
      setResultadosBusqueda(filtrados)
    } else {
      setResultadosBusqueda([])
    }
  }

  const handleScan = useCallback(async (codigo: string) => {
    setUltimoEscaneado(codigo)
    const producto = await buscarPorCodigo(codigo)
    if (producto) {
      agregarProducto(producto)
      setBusqueda('')
      alert(`Agregado: ${producto.nombre} - $${producto.precio_venta.toFixed(2)}`)
    } else {
      alert(`Producto no encontrado: ${codigo}`)
    }
  }, [buscarPorCodigo, agregarProducto])

  const agregarDesdeBusqueda = (producto: Producto) => {
    agregarProducto(producto)
    setBusqueda('')
    setResultadosBusqueda([])
    busquedaRef.current?.focus()
  }

  const abrirTeclado = (producto: Producto) => {
    setProductoTeclado(producto)
    setMostrarTeclado(true)
  }

  const confirmarCantidad = (cantidad: number) => {
    if (productoTeclado) agregarProducto(productoTeclado, cantidad)
    setMostrarTeclado(false)
    setProductoTeclado(null)
  }

  const calcularCambio = (monto: number) => {
    setRecibido(monto)
    setCambio(Math.max(0, monto - total))
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito esta vacio')
      return
    }

    // Si es credito, verificar que se selecciono cliente
    if (metodoPago === 'credito' && !clienteCredito) {
      setMostrarSelectorCliente(true)
      return
    }

    setProcesando(true)
    try {
      if (metodoPago === 'credito' && clienteCredito) {
        // Venta a credito
        await registrarVentaCredito(carrito, total, clienteCredito.id, clienteCredito.nombre)
        setVentaCompletada({
          items: carrito,
          total,
          metodoPago: 'credito',
          cliente: clienteCredito.nombre,
          fecha: new Date().toLocaleString('es-MX')
        })
      } else {
        // Venta normal
        await registrarVenta(carrito, total, metodoPago, recibido, cambio)
        setVentaCompletada({
          items: carrito,
          total,
          recibido,
          cambio,
          metodoPago,
          fecha: new Date().toLocaleString('es-MX')
        })
      }

      setMostrarPago(false)
      setMostrarTicket(true)
      limpiarCarrito()
      setRecibido(0)
      setCambio(0)
      setClienteCredito(null)
      setMetodoPago('efectivo')
    } catch (err: any) {
      alert('Error al procesar: ' + err.message)
    } finally {
      setProcesando(false)
    }
  }

  const seleccionarClienteCredito = (cliente: any) => {
    setClienteCredito(cliente)
    setMostrarSelectorCliente(false)
    // Procesar inmediatamente la venta a credito
    setProcesando(true)
    registrarVentaCredito(carrito, total, cliente.id, cliente.nombre)
      .then(() => {
        setVentaCompletada({
          items: carrito,
          total,
          metodoPago: 'credito',
          cliente: cliente.nombre,
          fecha: new Date().toLocaleString('es-MX')
        })
        setMostrarPago(false)
        setMostrarTicket(true)
        limpiarCarrito()
        setClienteCredito(null)
        setMetodoPago('efectivo')
      })
      .catch((err: any) => alert('Error: ' + err.message))
      .finally(() => setProcesando(false))
  }

  const imprimirTicket = () => {
    const ventana = window.open('', '_blank')
    if (ventana && ticketRef.current) {
      ventana.document.write(`
        <html>
          <head><title>Ticket - Miscelanea Irving</title></head>
          <body style="margin:0;padding:20px;display:flex;justify-content:center;font-family:monospace;">
            ${ticketRef.current.outerHTML}
          </body>
        </html>
      `)
      ventana.document.close()
      ventana.print()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-sm">Punto de Venta</h1>
              <p className="text-xs text-gray-500">Miscelanea Irving</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ultimoEscaneado && (
              <span className="text-xs text-gray-400 font-mono hidden sm:block">Ultimo: {ultimoEscaneado}</span>
            )}
            <div className="bg-blue-50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">{cantidadItems()} items</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 bg-white border-b">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={busquedaRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  placeholder="Buscar producto..."
                  className="input pl-10 text-sm"
                />
              </div>
              <button onClick={() => setEscanerActivo(true)} className="btn-primary px-3 py-2">
                <ScanBarcode className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Escanear</span>
              </button>
            </div>
            {resultadosBusqueda.length > 0 && (
              <div className="absolute z-30 left-3 right-3 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto">
                {resultadosBusqueda.map(p => (
                  <button key={p.id} onClick={() => agregarDesdeBusqueda(p)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left">
                    <Package className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.nombre}</p>
                      <p className="text-xs text-gray-500">{p.codigo_barras}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">${p.precio_venta.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</h3>
              <span className="text-xs text-gray-400">{productos.length} disponibles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
              {productos.slice(0, 25).map(p => (
                <button key={p.id} onClick={() => agregarProducto(p)} onContextMenu={(e) => { e.preventDefault(); abrirTeclado(p) }} className="card p-2.5 text-left hover:shadow-md transition-all active:scale-95 hover:border-blue-300">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-medium text-xs line-clamp-2 leading-tight">{p.nombre}</p>
                  <p className="text-base font-bold text-blue-600 mt-1">${p.precio_venta.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400">Stock: {p.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 xl:w-96 bg-white border-l flex flex-col shadow-lg">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center gap-2 text-gray-700">
              <ShoppingCart className="w-4 h-4" />
              <h2 className="font-bold text-sm">Carrito</h2>
              <span className="badge bg-blue-100 text-blue-700 text-[10px]">{cantidadItems()}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {carrito.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ScanLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Carrito vacio</p>
                <p className="text-xs">Escanea o selecciona productos</p>
                <button onClick={() => setEscanerActivo(true)} className="mt-3 btn-primary text-xs py-2 px-3">
                  <ScanBarcode className="w-4 h-4" /> Escanear Ahora
                </button>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.producto_id} className="card p-2.5 border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.producto?.nombre}</p>
                      <p className="text-[10px] text-gray-500">${item.precio_unitario.toFixed(2)} c/u</p>
                    </div>
                    <button onClick={() => quitarProducto(item.producto_id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-blue-600 text-sm">${item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Total</span>
              <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { limpiarCarrito(); setRecibido(0); setCambio(0); }} className="btn-outline py-2.5 text-sm" disabled={carrito.length === 0}>
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={() => setMostrarPago(true)} className="btn-success py-2.5 text-sm" disabled={carrito.length === 0}>
                <Check className="w-4 h-4" /> Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {escanerActivo && <BarcodeScanner onScan={handleScan} onClose={() => setEscanerActivo(false)} />}

      <TecladoNumerico visible={mostrarTeclado} titulo={`Cantidad: ${productoTeclado?.nombre}`} onConfirmar={confirmarCantidad} onCancelar={() => setMostrarTeclado(false)} />

      {/* Modal de Pago con opcion de Credito */}
      {mostrarPago && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Procesar pago</h2>
            <div className="text-center mb-6">
              <p className="text-gray-500">Total a pagar</p>
              <p className="text-4xl font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>

            {/* Metodos de pago incluyendo Credito */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {([
                { id: 'efectivo' as const, icon: Banknote, label: 'Efectivo', color: 'border-green-500 bg-green-50 text-green-700' },
                { id: 'tarjeta' as const, icon: CreditCard, label: 'Tarjeta', color: 'border-purple-500 bg-purple-50 text-purple-700' },
                { id: 'transferencia' as const, icon: Smartphone, label: 'Transfer', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                { id: 'credito' as const, icon: Users, label: 'Credito', color: 'border-orange-500 bg-orange-50 text-orange-700' }
              ]).map(({ id, icon: Icon, label, color }) => (
                <button
                  key={id}
                  onClick={() => { setMetodoPago(id); setClienteCredito(null) }}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    metodoPago === id ? color : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Si es credito, mostrar cliente seleccionado */}
            {metodoPago === 'credito' && clienteCredito && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                <p className="text-sm font-medium text-orange-800">Cliente: {clienteCredito.nombre}</p>
                <p className="text-xs text-orange-600">Limite: ${clienteCredito.limite_credito} | Saldo: ${clienteCredito.saldo_actual || 0}</p>
              </div>
            )}

            {/* Efectivo: calcular cambio */}
            {metodoPago === 'efectivo' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recibido</label>
                  <input type="number" value={recibido || ''} onChange={(e) => calcularCambio(parseFloat(e.target.value) || 0)} className="input text-lg font-bold" placeholder="0.00" autoFocus />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
                  <span className="text-gray-600">Cambio</span>
                  <span className={`text-xl font-bold ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>${cambio.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setMostrarPago(false)} className="btn-outline flex-1">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button
                onClick={procesarVenta}
                disabled={procesando || (metodoPago === 'efectivo' && cambio < 0) || (metodoPago === 'credito' && !clienteCredito && clientes.length === 0)}
                className="btn-success flex-1"
              >
                {procesando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Confirmar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Cliente para Credito */}
      {mostrarSelectorCliente && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Seleccionar Cliente</h2>
            <p className="text-gray-500 mb-4">Venta a credito de ${total.toFixed(2)}</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clientes.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay clientes registrados. Ve a Creditos para crear uno.</p>
              ) : (
                clientes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => seleccionarClienteCredito(c)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-all text-left"
                  >
                    <div>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.telefono}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Limite: ${c.limite_credito}</p>
                      <p className={`text-xs font-bold ${(c.saldo_actual || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>Saldo: ${c.saldo_actual || 0}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setMostrarSelectorCliente(false)} className="btn-outline w-full mt-4">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ticket de confirmacion */}
      {mostrarTicket && ventaCompletada && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Venta Exitosa!</h2>
              {ventaCompletada.cliente && <p className="text-orange-600 font-medium">Credito: {ventaCompletada.cliente}</p>}
              <p className="text-gray-500">{ventaCompletada.metodoPago === 'credito' ? 'Venta a credito registrada' : 'Venta procesada correctamente'}</p>
            </div>

            <div className="hidden">
              <Ticket ref={ticketRef} items={ventaCompletada.items} total={ventaCompletada.total} recibido={ventaCompletada.recibido || 0} cambio={ventaCompletada.cambio || 0} metodoPago={ventaCompletada.metodoPago} fecha={ventaCompletada.fecha} />
            </div>

            <div className="space-y-2">
              <button onClick={imprimirTicket} className="btn-primary w-full">
                <Printer className="w-5 h-5" /> Imprimir Ticket
              </button>
              <button onClick={() => { setMostrarTicket(false); setVentaCompletada(null) }} className="btn-outline w-full">
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}