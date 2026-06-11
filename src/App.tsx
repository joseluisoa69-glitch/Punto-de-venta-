import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Venta from './pages/Venta'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Historial from './pages/Historial'
import Proveedores from './pages/Proveedores'
import Creditos from './pages/Creditos'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Venta />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/creditos" element={<Creditos />} />
      </Routes>
    </Layout>
  )
}