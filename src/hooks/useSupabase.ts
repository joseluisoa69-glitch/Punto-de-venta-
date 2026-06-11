import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Producto } from '../types'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      setProductos(data || [])
    } catch (err: any) {
      console.error('Error cargando productos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarPorCodigo = useCallback(async (codigo: string) => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo_barras', codigo)
      .eq('activo', true)
      .single()
    if (error || !data) return null
    return data as Producto
  }, [])

  const crearProducto = useCallback(async (producto: any) => {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single()
    if (error) throw error
    await cargarProductos()
    return data
  }, [cargarProductos])

  useEffect(() => {
    cargarProductos()
    const channel = supabase
      .channel('productos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        cargarProductos()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [cargarProductos])

  return { productos, loading, cargarProductos, buscarPorCodigo, crearProducto }
}

export function useVentas() {
  const registrarVenta = useCallback(async (items: any[], total: number, metodoPago: string, recibido: number, cambio: number) => {
    const { data: venta, error: ventaError } = await supabase
      .from('ventas')
      .insert({ total, metodo_pago: metodoPago, recibido, cambio, usuario_id: 'anon' })
      .select()
      .single()
    if (ventaError) throw ventaError

    const itemsConVenta = items.map(item => ({
      venta_id: venta.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal
    }))
    
    const { error: itemsError } = await supabase.from('venta_items').insert(itemsConVenta)
    if (itemsError) throw itemsError

    for (const item of items) {
      await supabase.rpc('decrementar_stock', { p_id: item.producto_id, p_cantidad: item.cantidad })
    }
    return venta
  }, [])

  const cargarVentasPorFecha = useCallback(async (fechaInicio: string, fechaFin: string) => {
    const { data, error } = await supabase
      .from('ventas')
      .select('*, venta_items(*)')
      .gte('created_at', `${fechaInicio}T00:00:00`)
      .lte('created_at', `${fechaFin}T23:59:59`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }, [])

  return { registrarVenta, cargarVentasPorFecha }
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargarProveedores = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      setProveedores(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const crearProveedor = useCallback(async (proveedor: any) => {
    const { data, error } = await supabase
      .from('proveedores')
      .insert(proveedor)
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
      throw error
    }
    await cargarProveedores()
    return data
  }, [cargarProveedores])

  const registrarPago = useCallback(async (pago: any) => {
    const { data, error } = await supabase
      .from('pagos_proveedores')
      .insert(pago)
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
      throw error
    }
    return data
  }, [])

  useEffect(() => {
    cargarProveedores()
  }, [cargarProveedores])

  return { proveedores, loading, cargarProveedores, crearProveedor, registrarPago }
}

export function useClientes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      setClientes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCliente = useCallback(async (cliente: any) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
      throw error
    }
    await cargarClientes()
    return data
  }, [cargarClientes])

  const crearCredito = useCallback(async (credito: any) => {
    const { data, error } = await supabase
      .from('creditos')
      .insert(credito)
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
      throw error
    }
    return data
  }, [])

  const registrarAbono = useCallback(async (abono: any) => {
    const { data, error } = await supabase
      .from('pagos_creditos')
      .insert(abono)
      .select()
      .single()
    if (error) {
      alert('Error: ' + error.message)
      throw error
    }
    
    const { data: credito } = await supabase
      .from('creditos')
      .select('saldo_pendiente')
      .eq('id', abono.credito_id)
      .single()
      
    if (credito) {
      const nuevoSaldo = Math.max(0, credito.saldo_pendiente - abono.monto)
      await supabase
        .from('creditos')
        .update({ 
          saldo_pendiente: nuevoSaldo,
          estado: nuevoSaldo <= 0 ? 'pagado' : 'parcial'
        })
        .eq('id', abono.credito_id)
    }
    return data
  }, [])

  const cargarCreditos = useCallback(async (clienteId?: string) => {
    let query = supabase
      .from('creditos')
      .select('*, clientes(nombre)')
      .order('created_at', { ascending: false })
    if (clienteId) query = query.eq('cliente_id', clienteId)
    const { data, error } = await query
    if (error) return []
    return data || []
  }, [])

  useEffect(() => {
    cargarClientes()
  }, [cargarClientes])

  return { clientes, loading, cargarClientes, crearCliente, crearCredito, registrarAbono, cargarCreditos }
}