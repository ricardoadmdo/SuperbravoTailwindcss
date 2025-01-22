const { response, request } = require("express");
const mongoose = require("mongoose");
const Venta = require("../models/venta");
const Producto = require("../models/producto");
const Historial = require("../models/historial");

const obtenerProductosVendidos = async (req, res) => {
	try {
		// Obtiene todas las ventas
		const ventas = await Venta.find();

		// Objeto para acumular los productos vendidos
		const productosVendidos = {};

		// Itera sobre las ventas para agrupar productos
		ventas.forEach((venta) => {
			venta.productos.forEach((producto) => {
				if (!productosVendidos[producto.nombre]) {
					// Si el producto no está en el acumulador, inicialízalo
					productosVendidos[producto.nombre] = {
						nombre: producto.nombre,
						cantidadTotalVendida: 0,
					};
				}
				// Suma la cantidad vendida del producto
				productosVendidos[producto.nombre].cantidadTotalVendida += producto.cantidad;
			});
		});

		// Convierte el objeto en un arreglo para devolverlo como respuesta
		const resultado = Object.values(productosVendidos);

		res.status(200).json({
			ok: true,
			productos: resultado,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			ok: false,
			msg: "Error al obtener los productos vendidos",
		});
	}
};

const createVenta = async (req, res) => {
	const { productos, cliente, gestor, ...datos } = req.body;

	if (!productos || productos.length === 0) {
		return res.status(400).json({ message: "No hay productos en la venta." });
	}
	if (!cliente || !cliente.nombre || !cliente.carnet || !cliente.direccion) {
		return res.status(400).json({ message: "Los datos del cliente están incompletos." });
	}

	const gestorAjustado = gestor?.nombre?.trim() || "Ninguno";

	try {
		// Generar código de factura
		const inicioDia = new Date().setHours(0, 0, 0, 0);
		const finDia = new Date().setHours(23, 59, 59, 999);
		const ultimaVenta = await Venta.findOne(
			{ fecha: { $gte: inicioDia, $lte: finDia } },
			{ codigoFactura: 1 }
		).sort({ codigoFactura: -1 });
		const ultimoCodigo = ultimaVenta ? parseInt(ultimaVenta.codigoFactura, 10) : 0;
		const nuevoCodigoFactura = (ultimoCodigo + 1).toString().padStart(4, "0");

		// Buscar y completar los detalles de los productos
		const productosCompletos = [];
		for (const item of productos) {
			const producto = await Producto.findById(item.productoId);
			if (!producto) {
				return res.status(404).json({ message: `Producto con ID ${item.productoId} no encontrado.` });
			}

			if (producto.existencia < item.cantidad) {
				return res.status(400).json({
					message: `No hay suficiente existencia para el producto ${producto.nombre}.`,
				});
			}

			producto.existencia -= item.cantidad; // Actualizar existencia
			await producto.save();

			productosCompletos.push({
				productoId: producto._id,
				nombre: producto.nombre,
				codigo: producto.codigo,
				existencia: producto.existencia,
				costo: producto.costo,
				venta: producto.venta,
				precioGestor: producto.precioGestor,
				cantidad: item.cantidad,
			});
		}

		// Crear la venta
		const nuevaVenta = new Venta({
			...datos,
			productos: productosCompletos,
			cliente,
			gestor: gestorAjustado,
			codigoFactura: nuevoCodigoFactura,
		});
		await nuevaVenta.save();

		// Emitir el siguiente código de factura al frontend
		const siguienteCodigoFactura = (ultimoCodigo + 2).toString().padStart(4, "0");
		req.io.emit("actualizarCodigoFactura", siguienteCodigoFactura);

		res.status(201).json({ message: "Venta registrada con éxito", codigoFactura: nuevoCodigoFactura });
	} catch (error) {
		console.error("Error al registrar la venta:", error);
		res.status(500).json({ message: "Error al registrar la venta." });
	}
};

const getProductosVendidosPorFecha = async (req, res) => {
	try {
		const { fecha } = req.query; // Fecha enviada desde el frontend (formato ISO o compatible con Date)

		// Usar la fecha actual si no se proporciona una fecha
		const fechaBase = fecha ? new Date(fecha) : new Date();
		const inicioDia = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
		const finDia = new Date(inicioDia);
		finDia.setHours(23, 59, 59, 999);

		const productosVendidos = await Venta.aggregate([
			{ $match: { fecha: { $gte: inicioDia, $lt: finDia } } },
			{ $unwind: "$productos" },
			{
				$group: {
					_id: "$productos.nombre", // Agrupa por nombre del producto
					total: { $sum: "$productos.cantidad" }, // Suma las cantidades vendidas
				},
			},
			{ $sort: { total: -1 } }, // Ordena por cantidad vendida en orden descendente
		]);

		res.status(200).json(productosVendidos);
	} catch (error) {
		console.error("Error al obtener los productos vendidos:", error);
		res.status(500).json({ error: "Error al procesar la solicitud." });
	}
};

module.exports = {
	getProductosVendidosPorFecha,
};

const getProductoMasVendidoDiario = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth();
		const anioActual = fechaActual.getFullYear();

		const inicioMes = new Date(anioActual, mesActual, 1);
		const finMes = new Date(anioActual, mesActual + 1, 1);

		const productosMasVendidos = await Venta.aggregate([
			{ $match: { fecha: { $gte: inicioMes, $lt: finMes } } },
			{ $unwind: "$productos" },
			{
				$group: {
					_id: { dia: { $dayOfMonth: "$fecha" }, producto: "$productos.nombre" },
					totalCantidad: { $sum: "$productos.cantidad" },
				},
			},
			{ $sort: { "_id.dia": 1, "totalCantidad": -1 } },
			{
				$group: {
					_id: "$_id.dia",
					producto: { $first: "$_id.producto" },
					total: { $first: "$totalCantidad" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(productosMasVendidos);
	} catch (error) {
		console.error("Error al obtener el producto más vendido diario:", error);
		res.status(500).json({ error: "Error al procesar la solicitud." });
	}
};

const getVentas = async (req = request, res = response) => {
	try {
		const { day, month, year, limit = 8, page = 1, search = "" } = req.query;
		const skip = (page - 1) * limit;
		let query = {};

		// Filtrar por fecha si se proporciona
		if (day && month && year) {
			const startDate = new Date(year, month - 1, day);
			const endDate = new Date(year, month - 1, day);
			endDate.setHours(23, 59, 59, 999);

			query.fecha = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		// Filtrar por término de búsqueda en el arreglo de productos
		if (search) {
			query.productos = {
				$elemMatch: {
					nombre: { $regex: search, $options: "i" }, // Búsqueda parcial case-insensitive
				},
			};
		}

		// Ejecutar la consulta con paginación
		const [ventas, total] = await Promise.all([
			Venta.find(query).skip(Number(skip)).limit(Number(limit)),
			Venta.countDocuments(query),
		]);

		res.status(200).json({
			total,
			ventas,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error al obtener las ventas:", error);
		res.status(500).json({
			msg: "Error al obtener las ventas",
			error: error.message,
		});
	}
};

const getUltimoCodigoFactura = async (req, res) => {
	try {
		// Obtener el inicio y el final del día de hoy
		const inicioDia = new Date();
		inicioDia.setHours(0, 0, 0, 0); // Medianoche
		const finDia = new Date();
		finDia.setHours(23, 59, 59, 999); // Final del día

		// Buscar la venta con el mayor código de factura dentro del día actual
		const ultimaVenta = await Venta.findOne(
			{ fecha: { $gte: inicioDia, $lte: finDia } }, // Filtro por fecha del día actual
			{ codigoFactura: 1 }
		)
			.sort({ codigoFactura: -1 }) // Ordenar por código de factura en orden descendente
			.exec();

		// Obtener el último código de factura y calcular el siguiente
		const ultimoCodigoFactura = ultimaVenta ? parseInt(ultimaVenta.codigoFactura, 10) : 0;
		const proximoCodigoFactura = (ultimoCodigoFactura + 1).toString().padStart(4, "0");

		// Responder al cliente
		res.status(200).json({ proximoCodigoFactura });
	} catch (error) {
		console.error("Error al obtener el último código de factura:", error.message);
		res.status(500).json({ message: "Error al obtener el último código de factura" });
	}
};

const getAllVentasByDay = async (req = request, res = response) => {
	try {
		const { day, month, year } = req.query;
		let query = {};

		// Verificar si se ha proporcionado una fecha
		if (day && month && year) {
			const startDate = new Date(year, month - 1, day);
			const endDate = new Date(year, month - 1, day);
			endDate.setHours(23, 59, 59, 999);

			query.fecha = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		const ventas = await Venta.find(query);

		res.status(200).json({
			ventas,
		});
	} catch (error) {
		console.error("Error al obtener todas las ventas del día:", error);
		res.status(500).json({
			msg: "Error al obtener todas las ventas del día",
			error: error.message,
		});
	}
};

const getVentasPorMes = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth(); // Índice del mes (0-11)
		const anioActual = fechaActual.getFullYear();

		// Inicio y fin del mes
		const inicioMes = new Date(anioActual, mesActual, 1); // 1er día del mes
		const finMes = new Date(anioActual, mesActual + 1, 1); // 1er día del siguiente mes

		const ventasMensuales = await Venta.aggregate([
			{
				$match: {
					fecha: { $gte: inicioMes, $lt: finMes },
				},
			},
			{
				$group: {
					_id: { $dayOfMonth: "$fecha" },
					total: { $sum: "$precioTotal" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasMensuales);
	} catch (error) {
		console.error("Error al obtener las ventas del mes:", error);
		res.status(500).json({ error: "Error al obtener las ventas del mes" });
	}
};

const getVentasPorMesGestor = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth(); // Índice del mes (0-11)
		const anioActual = fechaActual.getFullYear();

		// Inicio y fin del mes
		const inicioMes = new Date(anioActual, mesActual, 1); // 1er día del mes
		const finMes = new Date(anioActual, mesActual + 1, 1); // 1er día del siguiente mes

		const ventasMensuales = await Venta.aggregate([
			{
				$match: {
					fecha: { $gte: inicioMes, $lt: finMes },
				},
			},
			{
				$group: {
					_id: { dia: { $dayOfMonth: "$fecha" }, gestor: "$gestor" },
					total: { $sum: "$precioTotal" },
				},
			},
			{ $sort: { "_id.dia": 1, "total": -1 } }, // Ordenar por día y luego por total en orden descendente
		]);

		// Filtrar gestores que no son "Ninguno"
		const ventasFiltradas = ventasMensuales.filter((venta) => venta._id.gestor.toLowerCase() !== "ninguno");

		// Encontrar el gestor con mayor venta por día
		const ventasMaximasPorDia = [];
		let currentDay = null;
		ventasFiltradas.forEach((venta) => {
			if (venta._id.dia !== currentDay) {
				ventasMaximasPorDia.push({
					dia: venta._id.dia,
					gestor: venta._id.gestor,
					total: venta.total,
				});
				currentDay = venta._id.dia;
			}
		});

		res.status(200).json(ventasMaximasPorDia);
	} catch (error) {
		console.error("Error al obtener las ventas del mes:", error);
		res.status(500).json({ error: "Error al obtener las ventas del mes" });
	}
};

const getVentasPorAno = async (req, res) => {
	try {
		const anioActual = new Date().getFullYear();

		// Inicio y fin del año
		const inicioAno = new Date(anioActual, 0, 1); // 1er día del año
		const finAno = new Date(anioActual + 1, 0, 1); // 1er día del siguiente año

		const ventasAnuales = await Venta.aggregate([
			{
				$match: {
					fecha: {
						$gte: inicioAno,
						$lt: finAno,
					},
				},
			},
			{
				$group: {
					_id: { $month: "$fecha" },
					total: { $sum: "$precioTotal" }, // Cambié '$total' a '$precioTotal' para mantener consistencia
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasAnuales);
	} catch (error) {
		console.error("Error al obtener las ventas del año:", error);
		res.status(500).json({ error: "Error al obtener las ventas del año" });
	}
};

const deleteVenta = async (req = request, res = response) => {
	const { id } = req.params;

	try {
		const ventaEliminada = await Venta.findByIdAndDelete(id);

		if (!ventaEliminada) {
			return res.status(404).json({ message: "Venta no encontrada" });
		}

		res.status(200).json({ message: "Venta eliminada con éxito" });
	} catch (error) {
		console.error("Error al eliminar venta:", error);
		res.status(500).json({ message: "Error al eliminar venta" });
	}
};

module.exports = {
	createVenta,
	getVentas,
	deleteVenta,
	getVentasPorAno,
	getVentasPorMes,
	getVentasPorMesGestor,
	getAllVentasByDay,
	getUltimoCodigoFactura,
	getProductoMasVendidoDiario,
	getProductosVendidosPorFecha,
	obtenerProductosVendidos,
};
