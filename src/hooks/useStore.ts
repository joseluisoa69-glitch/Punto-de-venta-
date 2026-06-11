import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto, VentaItem } from '../types'

interface StoreState {
  carrito: VentaItem[]
  agregarProducto: (producto: Producto, cantidad?: number) => void
  quitarProducto: (productoId: string) => void
  actualizarCantidad: (productoId: string, cantidad: number) => void
  limpiarCarrito: () => void
  totalCarrito: () => number
  cantidadItems: () => number
  escanerActivo: boolean
  setEscanerActivo: (activo: boolean) => void
  pantallaActiva: 'venta' | 'productos' | 'inventario' | 'reportes'
  setPantallaActiva: (pantalla: 'venta' | 'productos' | 'inventario' | 'reportes') => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      carrito: [],
      escanerActivo: false,
      pantallaActiva: 'venta',
      
      agregarProducto: (producto, cantidad = 1) => {
        const { carrito } = get()
        const existente = carrito.find(item => item.producto_id === producto.id)
        
        if (existente) {
          set({
            carrito: carrito.map(item =>
              item.producto_id === producto.id
                ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precio_unitario }
                : item
            )
          })
        } else {
          set({
            carrito: [...carrito, {
              producto_id: producto.id,
              cantidad,
              precio_unitario: producto.precio_venta,
              subtotal: cantidad * producto.precio_venta,
              producto
            }]
          })
        }
      },
      
      quitarProducto: (productoId) => {
        set({ carrito: get().carrito.filter(item => item.producto_id !== productoId) })
      },
      
      actualizarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitarProducto(productoId)
          return
        }
        set({
          carrito: get().carrito.map(item =>
            item.producto_id === productoId
              ? { ...item, cantidad, subtotal: cantidad * item.precio_unitario }
              : item
          )
        })
      },
      
      limpiarCarrito: () => set({ carrito: [] }),
      
      totalCarrito: () => get().carrito.reduce((sum, item) => sum + item.subtotal, 0),
      
      cantidadItems: () => get().carrito.reduce((sum, item) => sum + item.cantidad, 0),
      
      setEscanerActivo: (activo) => set({ escanerActivo: activo }),
      setPantallaActiva: (pantalla) => set({ pantallaActiva: pantalla })
    }),
    {
      name: 'punto-venta-irving'
    }
  )
)