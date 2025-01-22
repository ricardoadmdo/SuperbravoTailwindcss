import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import Axios from '../../api/axiosConfig';
import 'chart.js/auto';

const GraficosVentas = () => {
	const [ventasMes, setVentasMes] = useState([]);
	const [ventasAnuales, setVentasAnuales] = useState([]);

	useEffect(() => {
		const fetchDatosGraficos = async () => {
			try {
				const { data: ventasMensuales } = await Axios.get('/venta/mes');
				const { data: ventasAnuales } = await Axios.get('/venta/ano');

				// Procesar ventas mensuales
				const ventasPorDia = ventasMensuales.map(({ _id, total }) => ({
					dia: _id,
					total,
				}));

				// Procesar ventas anuales
				const ventasPorMes = ventasAnuales.map(({ _id, total }) => ({
					mes: _id,
					total,
				}));

				setVentasMes(ventasPorDia);
				setVentasAnuales(ventasPorMes);
			} catch (error) {
				console.error('Error al obtener datos para los gráficos:', error);
			}
		};

		fetchDatosGraficos();
	}, []);

	// Datos para el gráfico de barras (ventas por día)
	const datosVentasPorDia = {
		labels: ventasMes.map((venta) => `Día ${venta.dia}`),
		datasets: [
			{
				label: 'Ventas por Día',
				data: ventasMes.map((venta) => venta.total),
				backgroundColor: 'rgba(75, 192, 192, 0.6)',
			},
		],
	};

	// Datos para el gráfico de líneas (ventas por mes)
	const datosVentasAnuales = {
		labels: ventasAnuales.map((venta) => `Mes ${venta.mes}`),
		datasets: [
			{
				label: 'Ventas por Mes',
				data: ventasAnuales.map((venta) => venta.total),
				borderColor: 'rgba(153, 102, 255, 1)',
				backgroundColor: 'rgba(153, 102, 255, 0.2)',
			},
		],
	};

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Gráficos de Ventas</h2>

			{/* Gráfico de Ventas por Día */}
			<div className='mb-4'>
				<h4>Ventas por Día en el Mes</h4>
				<Bar data={datosVentasPorDia} />
			</div>

			{/* Gráfico de Ventas por Mes */}
			<div className='mb-4'>
				<h4>Ventas por Mes en el Año</h4>
				<Line data={datosVentasAnuales} />
			</div>
		</div>
	);
};

export default GraficosVentas;
