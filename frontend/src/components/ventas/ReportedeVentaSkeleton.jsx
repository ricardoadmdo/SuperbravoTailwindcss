import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ReporteVentasSkeleton = () => {
	const rows = Array.from({ length: 8 });

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">
				<Skeleton width={200} />
			</h2>

			{/* DatePicker siempre visible */}
			<div className="d-flex justify-content-center mb-4">
				<Skeleton width={250} height={40} />
			</div>

			{/* Barra de búsqueda */}
			<div className="mb-4 d-flex gap-2 align-items-center">
				<Skeleton width={300} height={40} />
				<Skeleton width={100} height={40} />
				<Skeleton width={100} height={40} />
			</div>

			{/* Estadísticas */}
			<div className="mb-4">
				<p>
					<strong>Total Recaudado del Día:</strong> <Skeleton width={100} />
				</p>
				<p>
					<strong>Ganancia Total del Día:</strong> <Skeleton width={100} />
				</p>
				<p>
					<strong>Ganancia Neta para Alejandro:</strong> <Skeleton width={100} />
				</p>
				<p>
					<strong>Producto Más Vendido:</strong> <Skeleton width={150} />
				</p>
			</div>

			{/* Tabla de ventas */}
			<div className="report-ventas__table-container">
				<table className="table report-ventas__table table-striped table-bordered">
					<thead className="thead-dark">
						<tr>
							<th>
								<Skeleton width={20} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={150} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={150} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((_, index) => (
							<tr key={index}>
								<td>
									<Skeleton width={20} />
								</td>
								<td>
									<Skeleton width={100} />
								</td>
								<td>
									<Skeleton width={150} />
								</td>
								<td>
									<Skeleton width={100} />
								</td>
								<td>
									<Skeleton width={150} />
								</td>
								<td>
									<Skeleton width={100} />
								</td>
								<td>
									<Skeleton width={100} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ReporteVentasSkeleton;
