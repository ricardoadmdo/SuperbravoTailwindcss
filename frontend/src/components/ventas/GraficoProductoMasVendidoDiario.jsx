import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PropTypes from "prop-types";

const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		const { producto, total } = payload[0].payload; // Obtener datos desde el payload
		return (
			<div
				style={{
					backgroundColor: "#fff",
					padding: "10px",
					border: "1px solid #ccc",
				}}
			>
				<p>{label}</p>
				<p>
					<strong>Producto:</strong> {producto}
				</p>
				<p>
					<strong>Cantidad vendida:</strong> {total}
				</p>
			</div>
		);
	}
	return null;
};

CustomTooltip.propTypes = {
	active: PropTypes.bool, // Es un booleano que indica si el tooltip está activo.
	payload: PropTypes.arrayOf(
		PropTypes.shape({
			payload: PropTypes.shape({
				producto: PropTypes.string.isRequired, // `producto` debe ser string.
				total: PropTypes.number.isRequired, // `total` debe ser número.
			}),
		})
	), // Es un arreglo de objetos con una estructura definida.
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Puede ser string o número.
};

const GraficoProductoMasVendidoDiario = () => {
	const [datosProductos, setDatosProductos] = useState([]);

	useEffect(() => {
		const fetchDatosProductos = async () => {
			try {
				// Llamada al backend para obtener datos
				const { data: ventasProductos } = await Axios.get("/venta/mas-vendido-diario");

				// Formatear los datos para el gráfico
				const datosProcesados = ventasProductos.map(({ _id, producto, total }) => ({
					dia: `Día ${_id}`, // Usa `_id` como día
					producto, // Producto más vendido
					total, // Cantidad vendida
				}));

				setDatosProductos(datosProcesados);
			} catch (error) {
				console.error("Error al obtener datos para el gráfico:", error);
			}
		};

		fetchDatosProductos();
	}, []);

	return (
		<div
			className="container my-5"
			style={{
				minHeight: "calc(100vh - 400px)", // Ajusta según el tamaño de tu header y footer
			}}
		>
			<h2 className="text-center mb-4">Producto Más Vendido Diario</h2>
			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={datosProductos} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="dia" />
					<YAxis />
					<Tooltip content={<CustomTooltip />} />
					<Bar dataKey="total" name="Cantidad Vendida" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default GraficoProductoMasVendidoDiario;
