-- Funcion para incrementar saldo de cliente al crear credito
CREATE OR REPLACE FUNCTION incrementar_saldo_cliente(p_id UUID, p_monto DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE clientes 
  SET saldo_actual = COALESCE(saldo_actual, 0) + p_monto 
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;