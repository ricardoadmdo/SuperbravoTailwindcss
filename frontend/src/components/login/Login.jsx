import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { AuthContext } from "../../auth/authContext";
import "./login.css";
import background from "../../images/login.jpg";
import { types } from "../../types/types";

const Login = () => {
	const [usuario, setUsername] = useState("");
	const [contrasena, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false); // Estado para el loading
	const navigate = useNavigate();
	const { dispatch } = useContext(AuthContext);

	const handleLogin = async () => {
		setIsLoading(true); // Activa el spinner
		try {
			const response = await Axios.post("/auth/login", {
				usuario,
				contrasena,
			});

			if (response.data.success) {
				const action = {
					type: types.login,
					payload: {
						nombre: response.data.nombre,
						rol: response.data.rol,
					},
				};
				dispatch(action);
				navigate("/agregar-venta");
				Swal.fire({
					toast: true,
					position: "top-end",
					title: "Éxito",
					text: "Inicio de sesión exitoso 🧑🏻",
					showConfirmButton: false,
					icon: "success",
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
			} else {
				Swal.fire({
					title: "Error",
					text: response.data.message,
					icon: "error",
					confirmButtonText: "Aceptar",
				});
			}
		} catch (error) {
			console.error("Error durante la autenticación:", error.response ? error.response.data : error.message);
			Swal.fire({
				title: "Error",
				text: "Usuario o contraseña incorrectos",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
		} finally {
			setIsLoading(false); // Desactiva el spinner
		}
	};

	// const createAdmin = async () => {
	// 	try {
	// 		const response = await Axios.post("/auth/create-admin", {
	// 			usuario: import.meta.env.VITE_USUARIO,
	// 			contrasena: import.meta.env.VITE_PASSWORD,
	// 			nombre: "Administrador",
	// 			rol: "Administrador",
	// 		});

	// 		if (response.data.success) {
	// 			Swal.fire({
	// 				title: "Éxito",
	// 				text: "Administrador creado con éxito",
	// 				icon: "success",
	// 				confirmButtonText: "Aceptar",
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("Error:", error);

	// 		Swal.fire({
	// 			title: "Alerta",
	// 			text: "El usuario administrador ya ha sido creado, por favor contactar al administrador",
	// 			icon: "warning",
	// 			confirmButtonText: "Aceptar",
	// 		});
	// 	}
	// };

	return (
		<div
			className="container-fluid d-flex justify-content-center align-items-center vh-100"
			style={{
				backgroundImage: `url(${background})`,
				backgroundSize: "cover",
				backgroundPosition: "center center",
			}}
		>
			<div className="text-center">
				<h1 className="text-white mb-4">Servicios Bravo</h1>

				<div
					className="card p-4 shadow text-center animate__animated animate__fadeIn"
					style={{ borderRadius: "24px", backgroundColor: "rgba(250, 250, 250, 0.9)" }}
				>
					<h3 className="mb-3">Iniciar Sesión</h3>
					<form
						className="d-grid gap-3"
						onSubmit={(e) => e.preventDefault()}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault(); // Evita el comportamiento por defecto del formulario (si lo hay)
								handleLogin();
							}
						}}
					>
						<div className="form-group">
							<label htmlFor="username">Nombre de Usuario:</label>
							<input
								type="text"
								className="form-control"
								id="username"
								placeholder="Ingrese su nombre de usuario"
								value={usuario}
								onChange={(e) => setUsername(e.target.value)}
								style={{ padding: "7px", fontSize: "1rem" }}
								required
							/>
						</div>

						<div className="form-group position-relative">
							<label htmlFor="password">Contraseña:</label>
							<input
								type="password"
								className="form-control"
								id="password"
								placeholder="Ingrese su contraseña"
								value={contrasena}
								onChange={(e) => setPassword(e.target.value)}
								style={{ padding: "10px", fontSize: "1rem" }}
								required
							/>
						</div>
						<button
							type="button"
							className="btn btn-success w-100 d-flex align-items-center justify-content-center"
							onClick={handleLogin}
							disabled={isLoading} // Deshabilita el botón mientras carga
						>
							{isLoading && (
								<div className="spinner-border spinner-border-sm me-2" role="status">
									<span className="visually-hidden">Cargando...</span>
								</div>
							)}
							Iniciar Sesión
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
