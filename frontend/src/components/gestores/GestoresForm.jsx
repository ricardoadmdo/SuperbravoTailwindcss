import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const GestoresForm = () => {
	const [spinner, setSpinner] = useState(false);
	const [nombre, setNombre] = useState("");
	const [editar, setEditar] = useState(false);
	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (id) {
			setEditar(true);
			getGestor(id);
		}
	}, [id]);

	const getGestor = (id) => {
		Axios.get(`/gestor/${id}`)
			.then((response) => {
				const gestor = response.data;
				setNombre(gestor.nombre);
			})
			.catch((error) => {
				console.error("Hubo un error al obtener el gestor:", error);
				Swal.fire({
					title: "Error",
					text: "Hubo un error al obtener el gestor. Por favor, intente de nuevo.",
					icon: "error",
					confirmButtonText: "Aceptar",
				});
			});
	};

	const add = () => {
		Axios.post("/gestor", { nombre })
			.then(() => {
				navigate("/gestionar-gestores");
				Swal.fire({
					toast: true,
					position: "top-end",
					icon: "success",
					title: "¡Registro exitoso!",
					html: `El gestor <strong>${nombre}</strong> se ha registrado con éxito! 👨🏻‍💼`,
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true,
					didOpen: (toast) => {
						toast.addEventListener("mouseenter", Swal.stopTimer);
						toast.addEventListener("mouseleave", Swal.resumeTimer);
					},
					customClass: {
						popup: "swal-popup-success",
						title: "swal-title",
						text: "swal-content",
					},
				});
			})
			.catch((error) => {
				console.error("Hubo un error al registrar el gestor:", error);
				Swal.fire({
					icon: "error",
					title: "Error al registrar",
					text: "Hubo un error al registrar el gestor. Por favor, intente de nuevo.",
					confirmButtonText: "Aceptar",
					customClass: {
						popup: "swal-popup-error",
						title: "swal-title-error",
						text: "swal-content-error",
					},
				});
			});
	};

	const update = () => {
		Axios.put(`/gestor/${id}`, { nombre })
			.then(() => {
				navigate("/gestionar-gestores");
				Swal.fire({
					toast: true,
					position: "top-end",
					icon: "success",
					title: "¡Actualización exitosa!",
					html: `El gestor <strong>${nombre}</strong> se ha actualizado con éxito! 👨🏻‍💼🔄`,
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true,
					didOpen: (toast) => {
						toast.addEventListener("mouseenter", Swal.stopTimer);
						toast.addEventListener("mouseleave", Swal.resumeTimer);
					},
					customClass: {
						popup: "swal-popup-success",
						title: "swal-title",
						text: "swal-content",
					},
				});
			})
			.catch((error) => {
				console.error("Hubo un error al actualizar el gestor:", error);
				Swal.fire({
					icon: "error",
					title: "Error al actualizar",
					text: "Hubo un error al actualizar el gestor. Por favor, intente de nuevo.",
					confirmButtonText: "Aceptar",
					customClass: {
						popup: "swal-popup-error",
						title: "swal-title-error",
						text: "swal-content-error",
					},
				});
			});
	};

	const handleSubmit = (event) => {
		setSpinner(!spinner);
		event.preventDefault();
		if (editar) {
			update();
		} else {
			add();
		}
	};

	return (
		<div className="container animate__animated animate__fadeIn my-4">
			<div className="row justify-content-center my-5">
				<div className="col-md-6">
					<div className="card shadow-sm bg-light">
						<div className="card-body">
							<h2 className="text-center mb-4">{editar ? "Editar Gestor" : "Agregar Nuevo Gestor"}</h2>
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label className="form-label">Nombre</label>
									<input
										type="text"
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
										placeholder="Ingrese el nombre"
										required
										className="form-control form-control-lg"
									/>
								</div>

								<div className="d-grid">
									<button type="submit" className="btn btn-success btn-lg" disabled={spinner}>
										{spinner && (
											<div className="spinner-border spinner-border-sm me-2" role="status">
												<span className="visually-hidden">Cargando...</span>
											</div>
										)}
										{editar ? "Actualizar" : "Registrar"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GestoresForm;
