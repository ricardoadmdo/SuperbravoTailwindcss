import { useIsMutating } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

const TablaVentas = ({ ventas, user, handleDeleteVenta }) => {
	// Obtén el estado de mutaciones activas
	const mutating = useIsMutating();

	const handleEliminarConConfirmacion = (ventaId) => {
		Swal.fire({
			title: "Eliminar",
			html: "¿Está seguro que desea eliminar esta venta? No podrá revertir esta acción.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				handleDeleteVenta(ventaId);
			}
		});
	};

	return (
		<div className="table-responsive rounded-3">
			<table className="table table-striped table-bordered">
				<thead
					style={{
						"--bs-table-bg": "#343a40", // Fondo negro
						"--bs-table-color": "#fff", // Texto blanco
						"backgroundColor": "var(--bs-table-bg)", // Asegura que el fondo se aplique
					}}
				>
					<tr>
						<th>#</th>
						<th>Hora</th>
						<th>Productos</th>
						<th>Total Recaudado</th>
						{user.rol === "Administrador" && <th>Ganancia por Venta</th>}
						<th>Factura</th>
						<th>Datos del Cliente</th>
						<th>Gestor</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{ventas.length === 0 ? (
						<tr>
							<td colSpan="9" className="text-center">
								No hay ventas para la fecha seleccionada.
							</td>
						</tr>
					) : (
						ventas.map((venta, index) => {
							// Calcular ganancia por venta
							const gananciaVenta = venta.productos.reduce((acum, producto) => {
								return acum + (producto.venta - producto.costo) * producto.cantidad;
							}, 0);

							const isDeleting = mutating > 0;

							return (
								<tr key={venta.uid}>
									<td>{index + 1}</td>
									<td>{new Date(venta.fecha).toLocaleTimeString()}</td>
									<td>
										<ul>
											{venta.productos.map((producto, idx) => (
												<li key={idx}>
													{producto.nombre} - {producto.cantidad} x $
													{producto.venta?.toLocaleString("en-US", {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</li>
											))}
										</ul>
									</td>
									<td>
										$
										{venta.precioTotal?.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
										CUP
									</td>
									{user.rol === "Administrador" && (
										<td>
											$
											{gananciaVenta.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}{" "}
											CUP
										</td>
									)}
									<td>{venta.codigoFactura || "N/A"}</td>
									<td>
										<ul>
											<li>
												<strong>Nombre:</strong> {venta.cliente?.nombre || "N/A"}
											</li>
											<li>
												<strong>Carnet:</strong> {venta.cliente?.carnet || "N/A"}
											</li>
											<li>
												<strong>Dirección:</strong> {venta.cliente?.direccion || "N/A"}
											</li>
										</ul>
									</td>
									<td>{venta.gestor || "N/A"}</td>
									<td>
										<button
											className="btn btn-danger d-flex align-items-center justify-content-center"
											onClick={() => handleEliminarConConfirmacion(venta.uid)}
											disabled={isDeleting}
										>
											{isDeleting ? (
												<span
													className="spinner-border spinner-border-sm"
													role="status"
													aria-hidden="true"
												></span>
											) : (
												<>
													<FontAwesomeIcon icon={faTrashAlt} /> Eliminar
												</>
											)}
										</button>
									</td>
								</tr>
							);
						})
					)}
				</tbody>
			</table>
		</div>
	);
};

TablaVentas.propTypes = {
	ventas: PropTypes.arrayOf(
		PropTypes.shape({
			uid: PropTypes.string.isRequired,
			fecha: PropTypes.string.isRequired,
			precioTotal: PropTypes.number.isRequired,
			productos: PropTypes.arrayOf(
				PropTypes.shape({
					nombre: PropTypes.string.isRequired,
					cantidad: PropTypes.number.isRequired,
					venta: PropTypes.number.isRequired,
					costo: PropTypes.number.isRequired,
				}).isRequired
			).isRequired,
			gestor: PropTypes.string,
			codigoFactura: PropTypes.string,
			cliente: PropTypes.shape({
				nombre: PropTypes.string,
				carnet: PropTypes.string,
				direccion: PropTypes.string,
			}),
		})
	).isRequired,
	user: PropTypes.shape({
		rol: PropTypes.string.isRequired,
	}).isRequired,
	handleDeleteVenta: PropTypes.func.isRequired,
};

export default TablaVentas;
