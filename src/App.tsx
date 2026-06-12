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
    <Routes>
      <Route path="/" element={<Layout><Venta /></Layout>} />
      <Route path="/historial" element={<Layout><Historial /></Layout>} />
      <Route path="/productos" element={<Layout><Productos /></Layout>} />
      <Route path="/inventario" element={<Layout><Inventario /></Layout>} />
      <Route path="/proveedores" element={<Layout><Proveedores /></Layout>} />
      <Route path="/creditos" element={<Layout><Creditos /></Layout>} />
      <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
    </Routes>
  )
}