export interface Producto {
  id: string
  codigo_barras: string
  nombre: string
  precio_venta: number
  precio_compra: number
  stock: number
  stock_minimo: number
  categoria: string
  unidad: string
  imagen_url?: string
  activo: boolean
  created_at: string
}

export interface VentaItem {
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto?: Producto
}

export interface Venta {
  id: string
  items: VentaItem[]
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
  recibido: number
  cambio: number
  created_at: string
  usuario_id: string
}

export interface Categoria {
  id: string
  nombre: string
  color: string
  icono: string
}

export interface EstadisticasDia {
  fecha: string
  total_ventas: number
  total_productos: number
  metodo_pago: string
  monto: number
}
