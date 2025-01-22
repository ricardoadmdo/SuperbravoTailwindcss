import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div
				className='custom-tooltip'
				style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}
			>
				<p className='label'>{`${label} : $${payload[0].value}`}</p>
				<p className='desc'>Total vendido por el gestor.</p>
			</div>
		);
	}

	return null;
};

CustomTooltip.propTypes = {
	active: PropTypes.bool,
	payload: PropTypes.arrayOf(PropTypes.object),
	label: PropTypes.number,
};

const GraficoGestorRecaudacionMensual = () => {
	const [datosRecaudacion, setDatosRecaudacion] = useState([]);

	useEffect(() => {
		const fetchDatosGraficos = async () => {
			try {
				const { data: ventasMensuales } = await Axios.get('/venta/gestor');

				// Filtrar ventas donde el gestor no es "Ninguno" o vacío
				const datosFiltrados = ventasMensuales.filter(
					({ gestor }) => gestor.toLowerCase() !== 'Ninguno' && gestor.trim().length > 0
				);

				// Convertir el objeto en un arreglo para el gráfico
				const datosProcesados = datosFiltrados.map(({ dia, gestor, total }) => ({
					dia,
					gestor,
					total,
				}));

				setDatosRecaudacion(datosProcesados);
			} catch (error) {
				console.error('Error al obtener los datos para los gráficos:', error);
			}
		};

		fetchDatosGraficos();
	}, []);

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Total Vendido por Gestores en el Mes</h2>
			<ResponsiveContainer width='100%' height={300}>
				<BarChart
					data={datosRecaudacion}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='dia' label={{ value: 'Días', position: 'insideBottom', offset: -5 }} />
					<YAxis label={{ value: 'Total Recaudado', angle: -90, position: 'insideLeft' }} />
					<Tooltip content={<CustomTooltip />} />
					<Legend />
					<Bar dataKey='total' barSize={20} fill='#8884d8' />
				</BarChart>
			</ResponsiveContainer>
			<div className='mt-4'>
				<h4 className='text-center'>Detalles de Recaudación</h4>
				<ul className='list-group'>
					{datosRecaudacion.map(({ dia, gestor, total }) => (
						<li
							key={`${dia}-${gestor}`}
							className='list-group-item d-flex justify-content-between align-items-center'
						>
							<span>{`Día: ${dia}, Gestor: ${gestor}`}</span>
							<span className='badge bg-primary rounded-pill'>${total}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default GraficoGestorRecaudacionMensual;
