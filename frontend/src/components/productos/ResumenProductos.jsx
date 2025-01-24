import { useEffect, useState, useRef } from "react";
import Axios from "../../api/axiosConfig";
import ProductSkeleton from "./ProductSkeleton";
import ErrorComponent from "../ui/ErrorComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";
import "./ResumenProductos.css";
import useAuthStore from "../../auth/authStore";

const fetchProductos = async () => {
	const response = await Axios.get(`/productos/all`);
	return response.data;
};

const ResumenProductos = () => {
	const { user } = useAuthStore();
	const [productosData, setProductosData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const componentRef = useRef();

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchProductos();
			setProductosData(data);
		} catch (error) {
			console.error("Error fetching productos:", error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Obtener fecha actual y formatearla
	const obtenerFechaFormateada = () => {
		const fecha = new Date();
		return fecha
			.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
			.replace(/\//g, "-"); // Cambiar barras por guiones
	};

	const handlePrint = async () => {
		try {
			// Selección del elemento a convertir
			const element = componentRef.current;

			// Configuración del PDF
			const fechaFormateada = obtenerFechaFormateada();
			const opt = {
				margin: 5, // Márgenes uniformes
				filename: `Reporte_de_Inventario_${fechaFormateada}.pdf`,
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: {
					scale: 2, // Mejor calidad para evitar cortes
					useCORS: true, // Soporte para recursos externos
				},
				jsPDF: {
					unit: "mm",
					format: "a3", // Cambiar a A3 para más espacio
					orientation: "landscape", // Orientación horizontal
				},
			};

			// Crear el PDF
			await html2pdf().set(opt).from(element).save();
		} catch (error) {
			console.error("Error al generar el PDF:", error);
		}
	};

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message="No se pudo cargar el resumen de productos" />;

	const productosList = productosData?.productos || [];
	const totalProductos = productosList.length;
	const totalGanancia = productosList.reduce(
		(acc, producto) => acc + ((producto.venta || 0) - (producto.costo || 0)) * (producto.existencia || 0),
		0
	);

	const totalGananciaNeta = productosList.reduce(
		(acc, producto) => acc + (producto.venta - producto.costo - producto.precioGestor) * producto.existencia,
		0
	);
	const totalCostoInventario = productosList.reduce((acc, producto) => acc + producto.costo * producto.existencia, 0);
	const totalGestor = productosList.reduce((acc, producto) => acc + producto.precioGestor * producto.existencia, 0);

	return (
		<div className={`container my-5 ${user.rol === "Administrador" ? "admin-view" : ""}`}>
			<div className="text-end">
				<button onClick={handlePrint} className="btn btn-primary">
					<FontAwesomeIcon icon={faPrint} /> Imprimir
				</button>
			</div>

			<div ref={componentRef}>
				<h4 className="text-center">Existencia de Productos</h4>
				<div className="d-flex justify-content-between mb-4">
					<span>Área: Almacén</span>
					<span>{obtenerFechaFormateada()}</span>
				</div>
				<ul className="list-group mb-4">
					<li className="list-group-item">
						<strong>Total de Productos:</strong> {totalProductos}
					</li>
					{user.rol === "Administrador" && (
						<>
							<li className="list-group-item">
								<strong>Total Costo de Inventario:</strong> $
								{totalCostoInventario.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</li>

							<li className="list-group-item">
								<strong>Total Ganancia Esperada:</strong> $
								{totalGanancia.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</li>
							<li className="list-group-item">
								<strong>Total Ganancia Neta:</strong> $
								{totalGananciaNeta.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</li>
						</>
					)}

					<li className="list-group-item">
						<strong>Total Gestor:</strong> $
						{totalGestor.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</li>
				</ul>
				<h5 className="text-center mb-4">Servicios Bravo</h5>
				<div className="table-responsive">
					<table className="table table-striped table-bordered rounded-3 overflow-hidden custom-table">
						<thead className="thead-dark">
							<tr>
								<th>Código</th>
								<th>Descripción</th>
								<th>Existencia</th>
								{user.rol === "Administrador" && <th>Costo</th>}
								<th>Venta</th>
								<th>Ganancia Gestor Unidad</th>
								{user.rol === "Administrador" && <th>Imp-Costo</th>}
								<th>Imp-Venta</th>
								<th>Imp-Venta sin Gestor</th>
								{user.rol === "Administrador" && <th>Ganancia Total</th>}
								{user.rol === "Administrador" && <th>Ganancia Neta</th>}
								<th>Ganancia Gestor</th>
							</tr>
						</thead>
						<tbody>
							{productosList.map((producto) => (
								<tr key={producto.uid}>
									<td>{producto.codigo}</td>
									<td>{producto.nombre}</td>
									<td>{producto.existencia.toFixed(2)}</td>
									{user.rol === "Administrador" && (
										<td>
											$
											{producto.costo.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</td>
									)}
									<td>
										$
										{producto.venta.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									<td>
										$
										{producto.precioGestor.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									{user.rol === "Administrador" && (
										<td>
											$
											{(producto.costo * producto.existencia).toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</td>
									)}
									<td>
										$
										{(producto.venta * producto.existencia).toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									<td>
										$
										{(
											producto.venta * producto.existencia -
											producto.precioGestor * producto.existencia
										).toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									{user.rol === "Administrador" && (
										<td>
											$
											{((producto.venta - producto.costo) * producto.existencia).toLocaleString(
												"en-US",
												{
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												}
											)}
										</td>
									)}
									{user.rol === "Administrador" && (
										<td>
											$
											{(
												(producto.venta - producto.precioGestor - producto.costo) *
												producto.existencia
											).toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</td>
									)}
									<td>
										$
										{(producto.precioGestor * producto.existencia).toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ResumenProductos;
