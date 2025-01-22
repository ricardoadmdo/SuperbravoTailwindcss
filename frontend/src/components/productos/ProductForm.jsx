import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { FaUpload } from "react-icons/fa"; // Import an icon

const cloudName = import.meta.env.VITE_CLOUDNAME;
const uploadPreset = import.meta.env.VITE_UPLOADPRESET;

const ProductForm = () => {
	const [nombre, setNombre] = useState("");
	const [codigo, setCodigo] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [existencia, setExistencia] = useState("");
	const [costo, setCosto] = useState("");
	const [venta, setVenta] = useState("");
	const [precioGestor, setPrecioGestor] = useState("");
	const [url, setUrl] = useState("");
	const [file, setFile] = useState(null);
	const [editar, setEditar] = useState(false);
	const [uploading, setUploading] = useState(false); // State to manage uploading
	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (id) {
			setEditar(true);
			getProducto(id);
		}
	}, [id]);

	const getProducto = (id) => {
		Axios.get(`/productos/${id}`)
			.then((response) => {
				const producto = response.data;
				setNombre(producto.nombre);
				setCodigo(producto.codigo);
				setDescripcion(producto.descripcion);
				setExistencia(producto.existencia);
				setCosto(producto.costo);
				setVenta(producto.venta);
				setPrecioGestor(producto.precioGestor);
				setUrl(producto.url);
			})
			.catch((error) => {
				Swal.fire({
					title: "Error",
					text: error,
					icon: "error",
					confirmButtonText: "Aceptar",
				});
			});
	};

	const uploadImageToCloudinary = async () => {
		setUploading(true); // Set uploading state to true
		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", uploadPreset);

		try {
			const response = await Axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
			setUploading(false); // Set uploading state to false
			return response.data.secure_url;
		} catch (error) {
			setUploading(false); // Set uploading state to false
			Swal.fire({
				title: "Error",
				text: "Hubo un error al subir la imagen.",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
			return null;
		}
	};

	const add = async () => {
		let imageUrl = url;
		if (file) {
			imageUrl = await uploadImageToCloudinary();
		}

		try {
			await Axios.post("/productos", {
				nombre,
				codigo,
				descripcion,
				existencia,
				costo,
				venta,
				precioGestor,
				url: imageUrl,
			});
			navigate("/gestionar-productos");
			Swal.fire({
				toast: true,
				position: "top-end",
				icon: "success",
				title: "¡Registro exitoso!",
				text: `El producto "${nombre}" se ha registrado con éxito 📦.`,
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
		} catch (error) {
			console.error("Error al registrar el producto:", error);
			Swal.fire({
				icon: "error",
				title: "Error al registrar",
				text: "No se pudo registrar el producto. Por favor, intente de nuevo.",
				confirmButtonText: "Aceptar",
				customClass: {
					popup: "swal-popup-error",
					title: "swal-title-error",
					text: "swal-content-error",
				},
			});
		}
	};

	const update = async () => {
		let imageUrl = url;
		if (file) {
			imageUrl = await uploadImageToCloudinary();
		}

		try {
			await Axios.put(`/productos/${id}`, {
				nombre,
				codigo,
				descripcion,
				existencia,
				costo,
				venta,
				precioGestor,
				url: imageUrl,
			});
			navigate("/gestionar-productos");
			Swal.fire({
				toast: true,
				position: "top-end",
				icon: "success",
				title: "¡Actualización exitosa!",
				text: `El producto "${nombre}" se ha actualizado con éxito📦🔄.`,
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
		} catch (error) {
			console.error("Error al actualizar el producto:", error);
			Swal.fire({
				icon: "error",
				title: "Error al actualizar",
				text: "No se pudo actualizar el producto. Por favor, intente de nuevo.",
				confirmButtonText: "Aceptar",
				customClass: {
					popup: "swal-popup-error",
					title: "swal-title-error",
					text: "swal-content-error",
				},
			});
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		if (editar) {
			update();
		} else {
			add();
		}
	};

	const onDrop = (acceptedFiles) => {
		setFile(acceptedFiles[0]);
	};

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<div className="container my-4">
			<div className="row justify-content-center">
				<div className="col-12 col-md-8 col-lg-6">
					<div className="card shadow-sm">
						<div className="card-body bg-light">
							<h2 className="text-center mb-4">
								{editar ? "Editar Producto" : "Agregar Nuevo Producto"}
							</h2>
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label className="form-label">Nombre</label>
									<input
										type="text"
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
										placeholder="Ingrese el nombre"
										required
										className="form-control"
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Código</label>
									<input
										type="number"
										value={codigo}
										onChange={(e) => setCodigo(e.target.value)}
										placeholder="Ingrese el código"
										required
										className="form-control"
									/>
								</div>

								<div className="mb-3">
									<label className="form-label">Descripción</label>
									<input
										type="text"
										value={descripcion}
										onChange={(e) => setDescripcion(e.target.value)}
										placeholder="Ingrese la descripción"
										required
										className="form-control"
									/>
								</div>

								<div className="mb-3">
									<label className="form-label">Existencia</label>
									<input
										type="number"
										value={existencia}
										onChange={(e) => setExistencia(e.target.value)}
										placeholder="Ingrese la existencia"
										required
										className="form-control"
										step="any" // Allows decimal values
									/>
								</div>

								<div className="mb-3">
									<label className="form-label">Precio de Costo</label>
									<input
										type="number"
										value={costo}
										onChange={(e) => setCosto(e.target.value)}
										placeholder="Ingrese el costo"
										required
										className="form-control"
										step="any" // Allows decimal values
									/>
								</div>

								<div className="mb-3">
									<label className="form-label">Precio de Venta</label>
									<input
										type="number"
										value={venta}
										onChange={(e) => setVenta(e.target.value)}
										placeholder="Ingrese el precio de venta"
										required
										className="form-control"
										step="any" // Allows decimal values
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Ganancia para el Gestor</label>
									<input
										type="number"
										value={precioGestor}
										onChange={(e) => setPrecioGestor(e.target.value)}
										placeholder="Ingrese la ganancia para el gestor"
										required
										className="form-control"
										step="any" // Allows decimal values
									/>
								</div>

								<div className="mb-3">
									<label className="form-label">Imagen del Producto</label>
									<div {...getRootProps({ className: "dropzone border p-4 text-center" })}>
										<input {...getInputProps()} />
										<FaUpload className="mb-2" size={50} color="#007BFF" /> {/* Image icon */}
										<p>
											{file
												? `Archivo seleccionado: ${file.name}`
												: "Arrastra una imagen o haz clic para seleccionarla"}
										</p>
									</div>
									{uploading && <p className="text-dark">Subiendo imagen, por favor espera...</p>}{" "}
									{/* Loading message */}
								</div>

								<div className="d-grid">
									<button type="submit" className="btn btn-success" disabled={uploading}>
										{uploading && (
											<div className="spinner-border spinner-border-sm me-2" role="status">
												<span className="visually-hidden">Cargando...</span>
											</div>
										)}
										{editar ? "Actualizar" : "Guardar"}
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

export default ProductForm;
