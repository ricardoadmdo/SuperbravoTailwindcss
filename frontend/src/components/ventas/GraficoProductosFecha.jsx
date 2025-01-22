import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Axios from "../../api/axiosConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GraficoProductosPorFecha = () => {
	const [productosVendidos, setProductosVendidos] = useState([]);
	const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date()); // Por defecto, el día actual

	useEffect(() => {
		const fetchProductosVendidos = async () => {
			try {
				const { data } = await Axios.get("/venta/productos-por-fecha", {
					params: { fecha: fechaSeleccionada.toISOString() }, // Enviar fecha seleccionada
				});

				// Asignar colores únicos a cada producto
				const coloresUnicos = {};
				data.forEach(({ _id }) => {
					if (!coloresUnicos[_id]) {
						coloresUnicos[_id] = `hsl(${Math.random() * 360}, 70%, 50%)`;
					}
				});

				// Procesar los datos para el gráfico
				const productosProcesados = data.map(({ _id, total }) => ({
					nombre: _id, // Nombre del producto
					total, // Cantidad vendida
					color: coloresUnicos[_id], // Color único para el producto
				}));

				setProductosVendidos(productosProcesados);
			} catch (error) {
				console.error("Error al obtener productos vendidos:", error);
			}
		};

		fetchProductosVendidos();
	}, [fechaSeleccionada]); // Recargar datos cuando cambie la fecha

	return (
		<div
			className="container my-5"
			style={{
				minHeight: "calc(100vh - 410px)", // Ajusta según el tamaño de tu header y footer
			}}
		>
			<h2 className="text-center mb-4">Productos Vendidos</h2>

			{/* Selector de Fecha */}
			<div className="d-flex flex-column align-items-center mb-4">
				<label htmlFor="datepicker">Seleccione una fecha:</label>
				<DatePicker
					id="datepicker"
					selected={fechaSeleccionada}
					onChange={setFechaSeleccionada} // Actualiza la fecha seleccionada
					dateFormat="dd/MM/yyyy"
					className="form-control"
				/>
			</div>

			{/* Gráfico */}
			<ResponsiveContainer
				width="100%"
				height={window.innerWidth < 768 ? 300 : 400} // Ajusta la altura en función del tamaño de la pantalla
			>
				<BarChart
					data={productosVendidos}
					margin={{
						top: 10,
						right: window.innerWidth < 768 ? 10 : 30,
						left: window.innerWidth < 768 ? 20 : 70,
						bottom: window.innerWidth < 768 ? 20 : 50, // Reduce el margen inferior
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="nombre" tick={false} />
					<YAxis />
					<Tooltip formatter={(value) => [`${value} unidades`]} />
					<Bar dataKey="total" name="Cantidad Vendida" isAnimationActive={true}>
						{productosVendidos.map((producto) => (
							<Cell key={producto.nombre} fill={producto.color} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default GraficoProductosPorFecha;
