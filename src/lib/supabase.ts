import { createClient } from '@supabase/supabase-js'

// ============================================
// SUPABASE - MISCELANEA IRVING
// Lee variables de entorno (Vercel) o usa valores por defecto
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ichlutncamnjpobtcqcc.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_L2ayRstjkFmXMK3q7svTig_ynvlqOMr'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Tipos de tablas para TypeScript
export type Database = {
  public: {
    Tables: {
      productos: {
        Row: {
          id: string
          codigo_barras: string
          nombre: string
          precio_venta: number
          precio_compra: number
          stock: number
          stock_minimo: number
          categoria: string
          unidad: string
          imagen_url: string | null
          activo: boolean
          created_at: string
        }
      }
      ventas: {
        Row: {
          id: string
          total: number
          metodo_pago: string
          recibido: number
          cambio: number
          created_at: string
          usuario_id: string
        }
      }
      venta_items: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          color: string
          icono: string
          created_at: string
        }
      }
    }
  }
}