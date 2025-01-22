import { useState, useEffect, useContext } from "react";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../ui/Pagination";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UsuariosSkeleton from "./UsuariosSkeleton";
import ErrorComponent from "../ui/ErrorComponent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsuarios } from "../../api/fetchData";
import { AuthContext } from "../../auth/authContext";

const useUsuarios = (page, limit) => {
	return useQuery({
		queryKey: ["usuarios", page, limit],
		queryFn: () => fetchUsuarios(page, limit),
		keepPreviousData: true,
		staleTime: 5000,
		select: (data) => ({
			usuarios: data?.usuarios || [],
			totalPages: data?.totalPages || 1,
		}),
	});
};

const UsuarioList = () => {
	const { user } = useContext(AuthContext);
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);
	const navigate = useNavigate();

	const { data, isLoading, isError, refetch } = useUsuarios(currentPage, limit);

	useEffect(() => {
		queryClient.prefetchQuery({
			queryKey: ["usuarios", currentPage + 1, limit],
			queryFn: () => fetchUsuarios(currentPage + 1, limit),
		});
	}, [currentPage, limit, queryClient]);

	const deleteUsuario = async (usuario) => {
		if (usuario.rol === "Administrador" && user.nombre !== "Developer") {
			Swal.fire({
				title: "Error",
				text: "No se puede eliminar un usuario con rol Administrador",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
			return;
		}

		try {
			const result = await Swal.fire({
				title: `Eliminar Usuario: ${usuario.nombre}`,
				html: `<p>¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Eliminar",
				cancelButtonText: "Cancelar",
			});

			if (result.isConfirmed) {
				// Enviar el usuario actual al backend para verificación adicional
				await Axios.delete(`/usuarios/${usuario.uid}`, {
					data: { currentUser: user.nombre }, // Se envía quién intenta eliminar
				});

				Swal.fire({
					title: "Usuario eliminado!",
					html: `<i>El usuario <strong>${usuario.nombre}</strong> ha sido eliminado con éxito.</i>`,
					icon: "success",
					timer: 3000,
				});

				// Invalidar la caché para recargar la lista
				queryClient.invalidateQueries(["usuarios", currentPage, limit]);

				// Refetch para actualizar la lista de usuarios
				refetch();
			}
		} catch (error) {
			console.error("Error eliminando usuario:", error);
			Swal.fire("Error", "No se pudo eliminar el usuario", "error");
		}
	};

	if (isLoading) {
		return (
			<div role="status" aria-live="polite">
				<UsuariosSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorComponent message="No se pudo cargar la lista de usuarios">
				<button onClick={() => refetch()} disabled={isLoading} className="btn btn-primary">
					Reintentar
				</button>
			</ErrorComponent>
		);
	}

	const usuariosList = data?.usuarios || [];
	const totalPages = data?.totalPages || 1;

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">Lista de Usuarios</h2>
			<div className="text-center mb-4">
				<Link to="/usuarioform" className="btn btn-success">
					Agregar Nuevo Usuario
				</Link>
			</div>
			<div className="table-responsive">
				<table className="table table-striped table-bordered rounded-3 overflow-hidden">
					<thead className="thead-dark">
						<tr>
							<th>Nombre</th>
							<th>Usuario</th>
							<th>Rol</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usuariosList
							.filter((val) => val.nombre !== "Developer") // Filtrar usuarios cuyo nombre es 'developer'
							.map((val) => (
								<tr key={val.uid}>
									<td>{val.nombre}</td>
									<td>{val.usuario}</td>
									<td>{val.rol}</td>
									<td className="d-flex justify-content-between">
										<button
											type="button"
											className="btn btn-secondary"
											onClick={() => navigate(`/editUser/${val.uid}`)}
										>
											<FontAwesomeIcon icon={faEdit} /> Editar
										</button>
										<button
											type="button"
											className="btn btn-danger"
											onClick={() => deleteUsuario(val)}
										>
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

export default UsuarioList;
