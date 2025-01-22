import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Pagination from "./ui/Pagination";
import ProductSkeleton from "./productos/ProductSkeleton";
import ErrorComponent from "./ui/ErrorComponent";
import Axios from "../api/axiosConfig";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const fetchHistorial = async ({ queryKey }) => {
	const [{ productoId, page, limit }] = queryKey;
	const response = await Axios.get(`/historial/producto/${productoId}`, {
		params: { page, limit },
	});
	return response.data;
};

const HistorialCompleto = () => {
	const { productoId } = useParams(); // Obtén el ID del producto desde la URL
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1); // Página actual
	const limit = 20; // Número de elementos por página

	// React Query para cargar el historial
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: [{ productoId, page: currentPage, limit }],
		queryFn: fetchHistorial,
		keepPreviousData: true, // Mantiene los datos de la página anterior mientras se carga la nueva
		staleTime: 5000, // Tiempo antes de considerar los datos obsoletos
	});

	// Manejo de error
	if (isError) {
		return (
			<ErrorComponent message="No se pudo cargar el historial">
				<button onClick={refetch} className="btn btn-primary">
					Reintentar
				</button>
			</ErrorComponent>
		);
	}

	return (
		<div className="container py-5">
			<h2 className="text-center mb-4">Historial Completo</h2>

			{/* Botón Volver */}
			<div className="d-flex justify-content-start align-items-center mb-4">
				<button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
					<ArrowLeft size={20} />
					<span>Volver</span>
				</button>
			</div>

			{/* Skeleton mientras se cargan los datos */}
			{isLoading ? (
				<ProductSkeleton />
			) : data?.historial?.length > 0 ? (
				<>
					<div className="table-responsive">
						{" "}
						{/* Hacer la tabla desplazable en móviles */}
						<table className="table table-striped table-bordered">
							<thead
								style={{
									"--bs-table-bg": "#343a40",
									"--bs-table-color": "#fff",
									"backgroundColor": "var(--bs-table-bg)",
								}}
							>
								<tr>
									<th>Fecha</th>
									<th>Hora</th>
									<th>Acción</th>
									<th>Detalles</th>
									<th>Cantidad</th>
								</tr>
							</thead>
							<tbody>
								{data.historial.map((item) => {
									const fecha = item.fecha ? new Date(item.fecha) : null;
									return (
										<tr key={item._id}>
											<td>{fecha ? fecha.toLocaleDateString() : "Fecha no disponible"}</td>
											<td>{fecha ? fecha.toLocaleTimeString() : "Hora no disponible"}</td>
											<td>{item.accion}</td>
											<td>{item.detalles}</td> {/* Muestra el cambio de nombre aquí */}
											<td>{item.cantidad || "N/A"}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* Paginación */}
					<div className="d-flex justify-content-center mt-4">
						<Pagination
							currentPage={currentPage}
							totalPages={data.totalPages}
							handlePreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							handleNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, data.totalPages))}
						/>
					</div>
				</>
			) : (
				<div className="alert alert-info text-center d-flex flex-column align-items-center p-4">
					<i className="bi bi-clock-history fs-2 mb-3"></i> {/* Ícono de Bootstrap Icons */}
					<p className="mb-0">
						<strong>Este producto no tiene historial registrado.</strong>
					</p>
					<small className="text-muted">
						Las acciones relacionadas con este producto aparecerán aquí en el futuro.
					</small>
				</div>
			)}
		</div>
	);
};

export default HistorialCompleto;
