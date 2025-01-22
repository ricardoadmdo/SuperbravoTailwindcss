import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../ui/Pagination";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GestoresSkeleton from "./GestoresSkeleton";
import ErrorComponent from "../ui/ErrorComponent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGestores } from "../../api/fetchData";

const useGestores = (page, limit) => {
	return useQuery({
		queryKey: ["gestor", page, limit],
		queryFn: () => fetchGestores(page, limit),
		keepPreviousData: true,
		staleTime: 5000,
		select: (data) => ({
			gestores: data?.gestores || [],
			totalPages: data?.totalPages || 1,
		}),
	});
};

const GestoresList = () => {
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);
	const navigate = useNavigate();

	const { data, isLoading, isError, refetch } = useGestores(currentPage, limit);

	useEffect(() => {
		queryClient.prefetchQuery({
			queryKey: ["gestor", currentPage + 1, limit],
			queryFn: () => fetchGestores(currentPage + 1, limit),
		});
	}, [currentPage, limit, queryClient]);

	const deleteGestor = async (gestor) => {
		const result = await Swal.fire({
			title: `Eliminar`,
			html: `¿Está seguro que desea eliminar el gestor <strong>${gestor.nombre}</strong>?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});

		if (result.isConfirmed) {
			try {
				await Axios.delete(`/gestor/${gestor.uid}`);
				await queryClient.invalidateQueries({ queryKey: ["gestor", currentPage, limit] });

				// Obtén el número total de gestores después de la eliminación
				const updatedData = await fetchGestores(currentPage, limit);

				// Si no hay gestores en la página actual, retrocede una página si es posible
				if (updatedData.gestores.length === 0 && currentPage > 1) {
					setCurrentPage((prevPage) => prevPage - 1);
				} else {
					// Si hay gestores, actualiza los datos
					await refetch();
				}

				Swal.fire({
					title: "Gestor eliminado!",
					html: `<i>El gestor <strong>${gestor.nombre}</strong> ha sido eliminado con éxito.</i>`,
					icon: "success",
					timer: 3000,
				});
			} catch (error) {
				console.error("Error eliminando gestor:", error);
				Swal.fire("Error", "No se pudo eliminar el gestor", "error");
			}
		}
	};

	if (isLoading) return <GestoresSkeleton />;
	if (isError) {
		return (
			<ErrorComponent message="No se pudo cargar la lista de gestores">
				<button onClick={() => refetch()} disabled={isLoading} className="btn btn-primary">
					Reintentar
				</button>
			</ErrorComponent>
		);
	}

	const gestoresList = data?.gestores || [];
	const totalPages = data?.totalPages || 1;

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">Lista de Gestores</h2>
			<div className="text-center mb-4">
				<Link to="/gestorform" className="btn btn-success">
					Agregar Nuevo Gestor
				</Link>
			</div>
			<div className="table-responsive">
				<table className="table table-striped table-bordered rounded-3 overflow-hidden">
					<thead className="thead-dark">
						<tr>
							<th>Nombre</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{gestoresList.map((val) => (
							<tr key={val.uid}>
								<td>{val.nombre}</td>
								<td className="d-flex justify-content-between">
									<button
										type="button"
										className="btn btn-secondary"
										onClick={() => navigate(`/editGestor/${val.uid}`)}
									>
										<FontAwesomeIcon icon={faEdit} /> Editar
									</button>
									<button type="button" className="btn btn-danger" onClick={() => deleteGestor(val)}>
										<FontAwesomeIcon icon={faTrashAlt} /> Eliminar
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					handlePreviousPage={handlePreviousPage}
					handleNextPage={handleNextPage}
				/>
			)}
		</div>
	);
};

export default GestoresList;
