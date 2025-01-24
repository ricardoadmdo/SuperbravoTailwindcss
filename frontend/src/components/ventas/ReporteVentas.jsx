import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../ui/Pagination";
import Swal from "sweetalert2";
import "../ventas/ReporteVentas.css";
import ReporteVentasSkeleton from "./ReportedeVentaSkeleton";
import Estadisticas from "./Estadisticas";
import TablaVentas from "./TablaVentas";
import { calcularEstadisticas, useVentasGlobales, useVentasPaginadas } from "../../hooks/ventasHooks";
import GananciaGestores from "./GananciaGestores";
import useAuthStore from "../../auth/authStore";

const ReporteVentas = () => {
	const [startDate, setStartDate] = useState(new Date());
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
	const [searchInput, setSearchInput] = useState("");
	const { user } = useAuthStore();

	const { ventas, totalPages, isLoading, isError, eliminarVenta } = useVentasPaginadas(
		startDate,
		currentPage,
		searchTerm
	);

	const ventasGlobales = useVentasGlobales(startDate);
	const { totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido } = calcularEstadisticas(ventasGlobales);

	const handleDeleteVenta = (id) => {
		eliminarVenta.mutate(id, {
			onError: () => {
				Swal.fire("Error", "No se pudo eliminar la venta.", "error");
			},
			onSuccess: () => {
				Swal.fire({
					title: "Venta eliminada!",
					html: `<i>La venta ha sido eliminada con éxito.</i>`,
					icon: "success",
					timer: 3000,
				});
			},
		});
	};

	const handleSearchInput = (e) => {
		setSearchInput(e.target.value.trimStart()); // Elimina espacios al inicio mientras escriben
	};

	const handleSearch = () => {
		if (!searchInput.trim()) {
			Swal.fire("Error", "Por favor, escribe algo para buscar", "warning");
			return;
		}
		setSearchTerm(searchInput.trim());
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm(""); // React-query recargará automáticamente las ventas del día
		setCurrentPage(1);
	};

	const handlePreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
	const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">Reporte de Ventas</h2>

			{/* DatePicker siempre visible */}
			<div className="d-flex flex-column align-items-center mb-4">
				<label htmlFor="datepicker">Seleccione una fecha:</label>
				<DatePicker
					id="datepicker"
					selected={startDate}
					onChange={setStartDate}
					dateFormat="dd/MM/yyyy"
					className="form-control"
				/>
			</div>

			{/* Estadísticas y GananciaGestores */}
			{!isLoading && !isError && (
				<>
					<Estadisticas {...{ totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido, user }} />
					<GananciaGestores ventas={ventasGlobales} />
				</>
			)}

			{/* Barra de búsqueda: SIEMPRE VISIBLE */}
			<div className="mb-4 d-flex gap-2 align-items-center">
				<input
					type="text"
					className="form-control"
					placeholder="Buscar ventas por nombre de productos..."
					value={searchInput}
					onChange={handleSearchInput}
				/>
				<button className="btn btn-primary" onClick={handleSearch} disabled={isLoading}>
					{isLoading && <div className="spinner-border spinner-border-sm text-light" role="status"></div>}
					Buscar
				</button>
				<button
					className="btn btn-outline-secondary"
					onClick={handleClearSearch}
					disabled={!searchInput.trim() && !searchTerm}
				>
					Limpiar Búsqueda
				</button>
			</div>

			{/* Manejo de errores y datos */}
			{isError ? (
				<p className="text-danger">Ocurrió un error al cargar las ventas.</p>
			) : isLoading ? (
				<ReporteVentasSkeleton />
			) : (
				<TablaVentas ventas={ventas} user={user} handleDeleteVenta={handleDeleteVenta} />
			)}
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={handlePreviousPage}
				handleNextPage={handleNextPage}
			/>
		</div>
	);
};

export default ReporteVentas;
