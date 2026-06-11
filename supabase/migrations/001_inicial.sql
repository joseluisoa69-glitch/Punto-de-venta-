-- ============================================
-- SUPABASE - PUNTO DE VENTA MISCELANEA IRVING
-- ============================================

-- Tabla de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  icono TEXT DEFAULT 'Package',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_barras TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  categoria TEXT REFERENCES categorias(nombre),
  unidad TEXT DEFAULT 'pz',
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
  recibido DECIMAL(10,2) NOT NULL DEFAULT 0,
  cambio DECIMAL(10,2) NOT NULL DEFAULT 0,
  usuario_id TEXT DEFAULT 'anon',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS venta_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Funcion para decrementar stock
CREATE OR REPLACE FUNCTION decrementar_stock(p_id UUID, p_cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE productos 
  SET stock = stock - p_cantidad 
  WHERE id = p_id AND stock >= p_cantidad;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Politicas de seguridad (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON venta_items FOR ALL USING (true) WITH CHECK (true);

-- Insertar categorias iniciales
INSERT INTO categorias (nombre, color, icono) VALUES
  ('general', '#6b7280', 'Package'),
  ('bebidas', '#3b82f6', 'Coffee'),
  ('alimentos', '#22c55e', 'Apple'),
  ('limpieza', '#06b6d4', 'Sparkles'),
  ('dulces', '#f59e0b', 'Candy'),
  ('cigarros', '#ef4444', 'Cigarette'),
  ('cerveza', '#8b5cf6', 'Beer')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (codigo_barras, nombre, precio_venta, precio_compra, stock, stock_minimo, categoria, unidad) VALUES
  ('7501055300078', 'Coca Cola 600ml', 18.00, 12.50, 24, 5, 'bebidas', 'pz'),
  ('7501055300085', 'Coca Cola 1.5L', 28.00, 20.00, 15, 3, 'bebidas', 'pz'),
  ('7501055300092', 'Coca Cola Zero 600ml', 18.00, 12.50, 20, 5, 'bebidas', 'pz'),
  ('7501055300108', 'Fanta Naranja 600ml', 16.00, 11.00, 18, 5, 'bebidas', 'pz'),
  ('7501055300115', 'Sprite 600ml', 16.00, 11.00, 18, 5, 'bebidas', 'pz'),
  ('7501055300122', 'Cerveza Corona 355ml', 20.00, 14.00, 36, 10, 'cerveza', 'pz'),
  ('7501055300139', 'Cerveza Modelo 355ml', 22.00, 15.50, 30, 8, 'cerveza', 'pz'),
  ('7501055300146', 'Cerveza Pacifico 355ml', 21.00, 15.00, 28, 8, 'cerveza', 'pz'),
  ('7501055300153', 'Sabritas Adobadas 45g', 13.00, 9.00, 40, 10, 'alimentos', 'pz'),
  ('7501055300160', 'Sabritas Original 45g', 13.00, 9.00, 35, 10, 'alimentos', 'pz'),
  ('7501055300177', 'Ruffles Queso 45g', 14.00, 10.00, 25, 8, 'alimentos', 'pz'),
  ('7501055300184', 'Doritos Nacho 45g', 14.00, 10.00, 30, 8, 'alimentos', 'pz'),
  ('7501055300191', 'Galletas Maria 170g', 10.00, 7.00, 50, 15, 'alimentos', 'pz'),
  ('7501055300207', 'Galletas Principe 120g', 15.00, 10.50, 30, 10, 'alimentos', 'pz'),
  ('7501055300214', 'Chokis 60g', 12.00, 8.50, 25, 8, 'dulces', 'pz'),
  ('7501055300221', 'Paletas Pica Fresa', 5.00, 3.50, 60, 20, 'dulces', 'pz'),
  ('7501055300238', 'Mazapan de la Rosa', 8.00, 5.50, 40, 15, 'dulces', 'pz'),
  ('7501055300245', 'Pelon Pelo Rico', 10.00, 7.00, 35, 10, 'dulces', 'pz'),
  ('7501055300252', 'Red Bull 250ml', 35.00, 25.00, 20, 5, 'bebidas', 'pz'),
  ('7501055300269', 'Monster Energy 473ml', 32.00, 23.00, 15, 5, 'bebidas', 'pz'),
  ('7501055300276', 'Cigarros Marlboro Rojo', 65.00, 55.00, 20, 5, 'cigarros', 'pz'),
  ('7501055300283', 'Cigarros Camel Azul', 62.00, 52.00, 18, 5, 'cigarros', 'pz')
ON CONFLICT (codigo_barras) DO NOTHING;