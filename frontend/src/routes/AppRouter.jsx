import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Barranavegacion from "../components/barra de navegacion/Barranavegacion";
import AgregarVenta from "../components/ventas/AgregarVenta";
import ProductForm from "../components/productos/ProductForm";
import ProductList from "../components/productos/ProductList";
import UsuarioForm from "../components/usuarios/UsuarioForm";
import UsuarioList from "../components/usuarios/UsuarioList";
import ReporteVentas from "../components/ventas/ReporteVentas";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";
import Error404 from "../components/Error404";
import GraficosVentas from "../components/ventas/GraficosVentas";
import GraficoGestorMasVendioDiario from "../components/ventas/GraficoGestorMasVendioDiario";
import ResumenProductos from "../components/productos/ResumenProductos";
import Footer from "../components/Footer";
import GestoresForm from "../components/gestores/GestoresForm";
import GestoresList from "../components/gestores/GestoresList";
import GraficoProductoMasVendidoDiario from "../components/ventas/GraficoProductoMasVendidoDiario";
import ProductosVendidos from "../components/ProductosVendidos";
import HistorialCompleto from "../components/HistorialCompleto";
import GraficoProductosPorFecha from "../components/ventas/GraficoProductosFecha";
import LoginPage from "../pages/LoginPage";

const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<LayoutWithNav />}>
					<Route
						path="/reporte-venta"
						element={
							<PrivateRoute>
								<ReporteVentas />
							</PrivateRoute>
						}
					/>
					<Route
						path="/gestionar-productos"
						element={
							<AdminRoute>
								<ProductList />
							</AdminRoute>
						}
					/>
					<Route
						path="/gestionar-gestores"
						element={
							<PrivateRoute>
								<GestoresList />
							</PrivateRoute>
						}
					/>
					<Route
						path="/grafico-ventas"
						element={
							<AdminRoute>
								<GraficosVentas />
							</AdminRoute>
						}
					/>
					<Route
						path="/grafico-venta-gestores"
						element={
							<AdminRoute>
								<GraficoGestorMasVendioDiario />
							</AdminRoute>
						}
					/>
					<Route
						path="/grafico-productos-mas-vendidos"
						element={
							<AdminRoute>
								<GraficoProductoMasVendidoDiario />
							</AdminRoute>
						}
					/>
					<Route
						path="/grafico-productos-dia"
						element={
							<AdminRoute>
								<GraficoProductosPorFecha />
							</AdminRoute>
						}
					/>
					<Route
						path="/prueba"
						element={
							<AdminRoute>
								<ProductosVendidos />
							</AdminRoute>
						}
					/>

					<Route
						path="/gestionar-usuarios"
						element={
							<AdminRoute>
								<UsuarioList />
							</AdminRoute>
						}
					/>
					<Route
						path="/agregar-venta"
						element={
							<PrivateRoute>
								<AgregarVenta />
							</PrivateRoute>
						}
					/>
					<Route
						path="/usuarioform"
						element={
							<AdminRoute>
								<UsuarioForm />
							</AdminRoute>
						}
					/>
					<Route
						path="/editUser/:id"
						element={
							<AdminRoute>
								<UsuarioForm />
							</AdminRoute>
						}
					/>
					<Route
						path="/productform"
						element={
							<AdminRoute>
								<ProductForm />
							</AdminRoute>
						}
					/>
					<Route
						path="/gestorform"
						element={
							<AdminRoute>
								<GestoresForm />
							</AdminRoute>
						}
					/>
					<Route
						path="/editGestor/:id"
						element={
							<AdminRoute>
								<GestoresForm />
							</AdminRoute>
						}
					/>
					<Route
						path="/historial/:productoId"
						element={
							<AdminRoute>
								<HistorialCompleto />
							</AdminRoute>
						}
					/>
					<Route
						path="/resumenProductos"
						element={
							<PrivateRoute>
								<ResumenProductos />
							</PrivateRoute>
						}
					/>
					<Route
						path="/edit/:id"
						element={
							<AdminRoute>
								<ProductForm />
							</AdminRoute>
						}
					/>
				</Route>
				<Route path="/" element={<LoginPage />} />
				{/* Ruta comodín para manejar rutas no existentes */}
				<Route path="*" element={<Error404 />} />
			</Routes>
		</BrowserRouter>
	);
};

const LayoutWithNav = () => (
	<>
		<Barranavegacion />
		<Outlet />
		<Footer />
	</>
);

export default AppRouter;
