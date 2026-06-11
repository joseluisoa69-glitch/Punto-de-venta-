import { forwardRef } from 'react'
import { Receipt, Store, Calendar, User } from 'lucide-react'
import type { VentaItem } from '../types'

interface TicketProps {
  items: VentaItem[]
  total: number
  recibido: number
  cambio: number
  metodoPago: string
  fecha: string
}

const Ticket = forwardRef<HTMLDivElement, TicketProps>(
  ({ items, total, recibido, cambio, metodoPago, fecha }, ref) => {
    return (
      <div ref={ref} className="bg-white p-6 w-80 font-mono text-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <Store className="w-8 h-8 mx-auto mb-2 text-gray-700" />
          <h2 className="font-bold text-lg">MISCELANEA IRVING</h2>
          <p className="text-gray-500 text-xs">Punto de Venta Digital</p>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {fecha}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            Metodo: {metodoPago.toUpperCase()}
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between mb-2 text-xs">
              <div className="flex-1">
                <span className="font-medium">{item.producto?.nombre || 'Producto'}</span>
                <br />
                <span className="text-gray-500">
                  {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                </span>
              </div>
              <div className="text-right font-medium">
                ${item.subtotal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>RECIBIDO:</span>
            <span>${recibido.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>CAMBIO:</span>
            <span>${cambio.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-dashed border-gray-300 pt-4">
          <Receipt className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500">Gracias por su compra!</p>
          <p className="text-xs text-gray-400 mt-1">Vuelva pronto</p>
        </div>
      </div>
    )
  }
)

Ticket.displayName = 'Ticket'
export default Ticket