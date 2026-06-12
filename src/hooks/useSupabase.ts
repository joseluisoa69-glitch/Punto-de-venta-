import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Producto } from '../types'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const { data, error } = await supabase.from('productos').select('*').eq('activo', true).order('nombre')
      if (error) throw error
      setProductos(data || [])
    } catch (err: any) { setError(err.message); console.error(err) }
    finally { setLoading(false) }
  }, [])

  const buscarPorCodigo = useCallback(async (codigo: string) => {
    try {
      const { data, error } = await supabase.from('productos').select('*').eq('codigo_barras', codigo).eq('activo', true).single()
      if (error || !data) return null
      return data as Producto
    } catch { return null }
  }, [])

  const crearProducto = useCallback(async (producto: any) => {
    const { data, error } = await supabase.from('productos').insert(producto).select().single()
    if (error) throw error
    await cargarProductos()
    return data
  }, [cargarProductos])

  const actualizarStock = useCallback(async (productoId: string, cantidad: number) => {
    const { error } = await supabase.rpc('decrementar_stock', { p_id: productoId, p_cantidad: cantidad })
    if (error) throw error
  }, [])

  useEffect(() => { cargarProductos() }, [cargarProductos])
  return { productos, loading, error, cargarProductos, buscarPorCodigo, crearProducto, actualizarStock }
}

export function useVentas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const registrarVenta = useCallback(async (items: any[], total: number, metodoPago: string, recibido: number, cambio: number) => {
    const { data: venta, error: ventaError } = await supabase.from('ventas').insert({ total, metodo_pago: metodoPago, recibido, cambio, usuario_id: 'anon' }).select().single()
    if (ventaError) throw ventaError
    const itemsConVenta = items.map(item => ({ venta_id: venta.id, producto_id: item.producto_id, cantidad: item.cantidad, precio_unitario: item.precio_unitario, subtotal: item.subtotal }))
    const { error: itemsError } = await supabase.from('venta_items').insert(itemsConVenta)
    if (itemsError) throw itemsError
    for (const item of items) { await supabase.rpc('decrementar_stock', { p_id: item.producto_id, p_cantidad: item.cantidad }) }
    return venta
  }, [])

  const cargarVentas = useCallback(async (fechaInicio?: string, fechaFin?: string) => {
    setLoading(true)
    try {
      let query = supabase.from('ventas').select('*, venta_items(*, productos(nombre, codigo_barras))').order('created_at', { ascending: false })
      if (fechaInicio && fechaFin) { query = query.gte('created_at', fechaInicio + 'T00:00:00').lte('created_at', fechaFin + 'T23:59:59') }
      else if (fechaInicio) { query = query.gte('created_at', fechaInicio + 'T00:00:00').lte('created_at', fechaInicio + 'T23:59:59') }
      const { data, error } = await query
      if (error) throw error
      setVentas(data || [])
    } catch (err) { console.error(err); setVentas([]) }
    finally { setLoading(false) }
  }, [])

  return { ventas, loading, registrarVenta, cargarVentas }
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const cargarProveedores = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('proveedores').select('*').eq('activo', true).order('nombre')
      if (error) throw error
      setProveedores(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const crearProveedor = useCallback(async (proveedor: any) => {
    const { data, error } = await supabase.from('proveedores').insert(proveedor).select().single()
    if (error) throw error
    await cargarProveedores()
    return data
  }, [cargarProveedores])

  const registrarPago = useCallback(async (pago: any) => {
    const { data, error } = await supabase.from('pagos_proveedores').insert(pago).select().single()
    if (error) throw error
    return data
  }, [])

  const cargarPagos = useCallback(async (proveedorId?: string) => {
    let query = supabase.from('pagos_proveedores').select('*, proveedores(nombre)').order('created_at', { ascending: false })
    if (proveedorId) query = query.eq('proveedor_id', proveedorId)
    const { data } = await query
    return data || []
  }, [])

  useEffect(() => { cargarProveedores() }, [cargarProveedores])
  return { proveedores, loading, cargarProveedores, crearProveedor, registrarPago, cargarPagos }
}

export function useClientes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const cargarClientes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('clientes').select('*').eq('activo', true).order('nombre')
      if (error) throw error
      setClientes(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const crearCliente = useCallback(async (cliente: any) => {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single()
    if (error) throw error
    await cargarClientes()
    return data
  }, [cargarClientes])

  const registrarCredito = useCallback(async (clienteId: string, items: any[], total: number) => {
    const { data: credito, error } = await supabase.from('creditos').insert({
      cliente_id: clienteId, total, saldo_pendiente: total, estado: 'pendiente', items: JSON.stringify(items)
    }).select().single()
    if (error) throw error
    await supabase.rpc('incrementar_saldo_cliente', { p_id: clienteId, p_monto: total })
    return credito
  }, [])

  const cargarCreditos = useCallback(async (clienteId?: string) => {
    let query = supabase.from('creditos').select('*, clientes(nombre, telefono, limite_credito, saldo_actual)').order('created_at', { ascending: false })
    if (clienteId) query = query.eq('cliente_id', clienteId)
    const { data } = await query
    return data || []
  }, [])

  const registrarAbono = useCallback(async (creditoId: string, clienteId: string, monto: number) => {
    const { data, error } = await supabase.from('pagos_creditos').insert({ credito_id: creditoId, cliente_id: clienteId, monto, metodo_pago: 'efectivo' }).select().single()
    if (error) throw error
    await supabase.rpc('abonar_credito', { p_id: creditoId, p_monto: monto })
    await supabase.rpc('decrementar_saldo_cliente', { p_id: clienteId, p_monto: monto })
    return data
  }, [])

  useEffect(() => { cargarClientes() }, [cargarClientes])
  return { clientes, loading, cargarClientes, crearCliente, registrarCredito, cargarCreditos, registrarAbono }
}