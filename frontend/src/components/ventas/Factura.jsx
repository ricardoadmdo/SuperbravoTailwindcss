import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";

const Factura = ({
	formState,
	setFormState,
	aumentarCantidad,
	disminuirCantidad,
	eliminarProducto,
	validarVenta,
	codigoFactura,
	cliente,
	handleClienteChange,
}) => {
	const [cantidadInput, setCantidadInput] = useState({});

	const handleInputChange = (uid, value) => {
		const cantidad = parseInt(value, 10);
		if (!isNaN(cantidad) && cantidad > 0) {
			setCantidadInput((prev) => ({
				...prev,
				[uid]: cantidad,
			}));
		}
	};

	const handleAumentarCantidad = (uid) => {
		const cantidad = cantidadInput[uid] || 1; // Usa la cantidad del input o 1 como predeterminado.
		aumentarCantidad(uid, cantidad);
	};

	const handleDisminuirCantidad = (uid) => {
		const cantidad = cantidadInput[uid] || 1; // Usa la cantidad del input o 1 como predeterminado.
		disminuirCantidad(uid, cantidad);
	};

	const facturaRef = useRef();

	const handlePrecioChange = (uid, value) => {
		const nuevoPrecio = parseFloat(value);
		if (isNaN(nuevoPrecio)) return;

		const productosActualizados = formState.productos.map((producto) => {
			if (producto.uid === uid) {
				return { ...producto, venta: nuevoPrecio };
			}
			return producto;
		});

		const precioTotal = productosActualizados.reduce(
			(total, producto) => total + producto.cantidad * producto.venta,
			0
		);

		setFormState({
			...formState,
			productos: productosActualizados,
			precioTotal,
		});
	};

	const generatePDF = () => {
		const element = facturaRef.current.cloneNode(true);
		element.querySelectorAll(".d-print-none").forEach((el) => el.remove());
		html2pdf()
			.from(element)
			.set({
				margin: 1,
				filename: `Factura_Servicios_Bravo_${codigoFactura}.pdf`,
				html2canvas: { scale: 2 },
				jsPDF: { orientation: "portrait" },
			})
			.save();
	};

	const handleValidarVenta = async () => {
		try {
			await validarVenta();
			generatePDF();
		} catch (error) {
			console.error("Error al validar la venta:", error);
		}
	};

	return (
		<div className="container mt-4 p-4 border rounded bg-white" ref={facturaRef}>
			<div className="text-center mb-4">
				<h4>Factura</h4>
			</div>
			<div className="mb-4">
				<div className="d-flex justify-content-between">
					<span className="fw-bold">Servicios Bravo</span>
					<span className="fw-bold">Código: {codigoFactura}</span>
				</div>
				<div className="text-start mt-2">
					<span>Falgueras entre auditor y Santa Catalina, Empresa de fósforos ENFOS Cerro, La Habana</span>
				</div>
				<div className="d-flex justify-content-between mt-3">
					<span className="fw-bold">Fecha: {new Date().toLocaleDateString()}</span>
				</div>
			</div>
			<div className="mb-4">
				<div className="table-responsive">
					<table className="table table-bordered">
						<thead className="table-light">
							<tr>
								<th>Descripción</th>
								<th>Precio Unitario</th>
								<th>Cantidad</th>
								<th>Monto</th>
								<th className="d-print-none">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{formState.productos.map((producto) => (
								<tr key={producto.uid}>
									<td>{producto.nombre}</td>
									<td>
										<input
											type="number"
											value={producto.venta}
											onChange={(e) => handlePrecioChange(producto.uid, e.target.value)}
											min="0"
											step="1"
											className="form-control border-0"
											style={{ maxWidth: "80px" }}
										/>
									</td>
									<td>{producto.cantidad}</td>
									<td>${producto.cantidad * producto.venta}</td>
									<td className="d-print-none">
										<div className="d-flex align-items-center">
											{/* Input para cantidad */}
											<input
												type="number"
												min="1"
												step="1"
												value={cantidadInput[producto.uid] || ""}
												onChange={(e) => handleInputChange(producto.uid, e.target.value)}
												className="form-control form-control-sm mr-2"
												style={{ maxWidth: "70px" }}
											/>
											{/* Botón para aumentar */}
											<button
												className="btn btn-secondary btn-sm ml-1"
												onClick={() => handleAumentarCantidad(producto.uid)}
											>
												<FontAwesomeIcon icon={faPlus} />
											</button>
											{/* Botón para disminuir */}
											<button
												className="btn btn-danger btn-sm ml-1"
												onClick={() => {
													if (producto.cantidad > 1) {
														handleDisminuirCantidad(producto.uid);
													} else {
														eliminarProducto(producto.uid);
													}
												}}
											>
												<FontAwesomeIcon icon={producto.cantidad > 1 ? faMinus : faTrashAlt} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<div className="d-flex justify-content-end">
				<div className="w-25">
					<div className="d-flex justify-content-between mb-2">
						<span>Subtotal:</span>
						<span>${formState.precioTotal.toFixed(2)}</span>
					</div>
					<div className="d-flex justify-content-between fw-bold mb-3">
						<span>Total:</span>
						<span>${formState.precioTotal.toFixed(2)}</span>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<h5>Datos del Cliente</h5>
				<div className="mb-2 d-flex">
					<span className="fw-bold">Nombre: </span>
					<input
						type="text"
						placeholder="Nombre del cliente"
						name="nombre"
						value={cliente.nombre}
						onChange={handleClienteChange}
						className="border-0 flex-grow-1"
						style={{ minWidth: "50px", flex: "1" }}
					/>
				</div>
				<div className="mb-2">
					<span className="fw-bold">Carnet de Identidad: </span>
					<input
						type="number"
						placeholder="Carnet del cliente"
						name="carnet"
						value={cliente.carnet}
						onChange={handleClienteChange}
						className="editable-input border-0 p-0"
						style={{ minWidth: "50px", flex: "1" }}
					/>
				</div>
				<div className="mb-2 d-flex">
					<span className="fw-bold">Dirección: </span>
					<input
						type="text"
						placeholder="Dirección del cliente"
						name="direccion"
						value={cliente.direccion}
						onChange={handleClienteChange}
						className="border-0 flex-grow-1"
						style={{ minWidth: "50px", flex: "1" }}
					/>
				</div>
				<div className="mb-2">Firma: ____________________________________</div>
			</div>
			<div className="d-print-none text-right">
				<button className="btn btn-success mr-1" onClick={handleValidarVenta}>
					Registrar Venta <FontAwesomeIcon icon={faPlus} />
				</button>
			</div>
		</div>
	);
};

// Validación de props
Factura.propTypes = {
	formState: PropTypes.shape({
		productos: PropTypes.arrayOf(
			PropTypes.shape({
				uid: PropTypes.string.isRequired,
				nombre: PropTypes.string.isRequired,
				cantidad: PropTypes.number.isRequired,
				venta: PropTypes.number.isRequired,
				existencia: PropTypes.number.isRequired,
			})
		).isRequired,
		totalProductos: PropTypes.number.isRequired,
		precioTotal: PropTypes.number.isRequired,
		fecha: PropTypes.instanceOf(Date).isRequired,
	}).isRequired,
	setFormState: PropTypes.func.isRequired,
	aumentarCantidad: PropTypes.func.isRequired,
	disminuirCantidad: PropTypes.func.isRequired,
	eliminarProducto: PropTypes.func.isRequired,
	validarVenta: PropTypes.func.isRequired,
	codigoFactura: PropTypes.string.isRequired,
	cliente: PropTypes.shape({
		nombre: PropTypes.string.isRequired,
		carnet: PropTypes.string.isRequired,
		direccion: PropTypes.string.isRequired,
	}).isRequired,
	handleClienteChange: PropTypes.func.isRequired,
};

export default Factura;
