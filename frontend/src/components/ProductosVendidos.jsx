import { useEffect, useState } from "react";
import Axios from "../api/axiosConfig";

const ProductosVendidos = () => {
	const [productos, setProductos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchProductosVendidos = async () => {
			try {
				const response = await Axios.get("/venta/prueba"); // Ruta al backend
				setProductos(response.data.productos);
			} catch (err) {
				setError("Error al cargar los productos vendidos.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchProductosVendidos();
	}, []);

	if (loading) return <p>Cargando...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
			<h1>Productos Vendidos</h1>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th style={thStyle}>Nombre del Producto</th>
						<th style={thStyle}>Cantidad Vendida</th>
					</tr>
				</thead>
				<tbody>
					{productos.map((producto, index) => (
						<tr key={index} style={index % 2 === 0 ? rowStyle : {}}>
							<td style={tdStyle}>{producto.nombre}</td>
							<td style={tdStyle}>{producto.cantidadTotalVendida.toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

// Estilos
const thStyle = {
	border: "1px solid #ddd",
	padding: "8px",
	backgroundColor: "#f4f4f4",
	textAlign: "left",
};

const tdStyle = {
	border: "1px solid #ddd",
	padding: "8px",
	textAlign: "left",
};

const rowStyle = {
	backgroundColor: "#f9f9f9",
};

export default ProductosVendidos;
