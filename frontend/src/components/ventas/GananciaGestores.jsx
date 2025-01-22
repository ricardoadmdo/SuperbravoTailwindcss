import PropTypes from "prop-types";

const GananciaGestores = ({ ventas }) => {
	// Calcular las ganancias de los gestores
	const gananciasPorGestor = ventas.reduce((acc, venta) => {
		const { gestor, productos } = venta;

		// Ignorar ventas con gestor "Ninguno" o sin gestor
		if (!gestor || gestor.trim().length === 0 || gestor.toLowerCase() === "ninguno") return acc;

		// Calcular la ganancia del gestor por cada producto
		productos.forEach((producto) => {
			const gananciaGestor = (producto.precioGestor || 0) * producto.cantidad;
			acc[gestor] = (acc[gestor] || 0) + gananciaGestor;
		});

		return acc;
	}, {});

	// Calcular el total de todas las ganancias de los gestores
	const totalGananciasGestores = Object.values(gananciasPorGestor).reduce((sum, ganancia) => sum + ganancia, 0);

	// Ordenar los gestores por ganancia de mayor a menor
	const gestoresOrdenados = Object.entries(gananciasPorGestor).sort((a, b) => b[1] - a[1]);

	return (
		<div className="ganancia-gestores">
			<h4>Ganancia por Gestor</h4>
			{gestoresOrdenados.length > 0 ? (
				<>
					<ul>
						{gestoresOrdenados.map(([gestor, ganancia]) => (
							<li key={gestor}>
								<strong>{gestor}:</strong> $
								{ganancia.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}{" "}
								CUP
							</li>
						))}
					</ul>
					<p>
						<strong>Total Ganancias de Gestores:</strong> $
						{totalGananciasGestores.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}{" "}
						CUP
					</p>
				</>
			) : (
				<p>No hay ganancias registradas para gestores.</p>
			)}
		</div>
	);
};

export default GananciaGestores;

GananciaGestores.propTypes = {
	ventas: PropTypes.arrayOf(
		PropTypes.shape({
			gestor: PropTypes.string.isRequired,
			productos: PropTypes.arrayOf(
				PropTypes.shape({
					venta: PropTypes.number.isRequired,
					costo: PropTypes.number.isRequired,
					cantidad: PropTypes.number.isRequired,
					precioGestor: PropTypes.number.isRequired,
				})
			).isRequired,
		})
	).isRequired,
};
