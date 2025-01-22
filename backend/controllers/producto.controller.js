const { response, request } = require("express");
const Producto = require("../models/producto");
const Historial = require("../models/historial");

const productosGet = async (req, res) => {
	try {
		const { limit = 8, page = 1, search } = req.query;
		const offset = (page - 1) * limit;

		const query = {};
		if (search) {
			query.nombre = new RegExp(search, "i"); // Búsqueda insensible a mayúsculas
		}

		const [total, productos] = await Promise.all([
			Producto.countDocuments(query),
			Producto.find(query).skip(offset).limit(Number(limit)),
		]);

		res.json({
			total,
			productos,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error al obtener los productos:", error);
		res.status(500).json({
			msg: "Error al obtener los productos",
			error: error.message,
		});
	}
};

const productosGetAll = async (req, res) => {
	try {
		const productos = await Producto.find();

		res.json({
			total: productos.length,
			productos,
		});
	} catch (error) {
		console.error("Error al obtener los productos:", error);
		res.status(500).json({
			msg: "Error al obtener los productos",
			error: error.message,
		});
	}
};

const productosBuscar = async (req, res) => {
	const { page, limit, search } = req.query;
	const productos = await Producto.find({
		nombre: { $regex: search, $options: "i" }, // Buscar por nombre (insensible a mayúsculas)
	})
		.skip((page - 1) * limit)
		.limit(Number(limit));

	const totalProductos = await Producto.countDocuments({
		nombre: { $regex: search, $options: "i" },
	});

	res.json({ productos, totalPages: Math.ceil(totalProductos / limit) });
};

const productosPost = async (req, res) => {
	const { nombre, codigo, descripcion, existencia, costo, venta, url, precioGestor } = req.body;

	try {
		const newProducto = new Producto({
			nombre,
			codigo,
			descripcion,
			existencia,
			costo,
			venta,
			url,
			precioGestor,
		});

		await newProducto.save();

		// Registrar en el historial
		const historial = new Historial({
			productoId: newProducto._id,
			accion: "CREAR",
			detalles: `Producto creado con existencia inicial de ${existencia}`,
			cantidad: existencia,
			precios: { costo, venta, precioGestor },
		});
		await historial.save();

		res.status(201).json(newProducto);
	} catch (error) {
		console.error("Error al crear producto:", error);
		res.status(500).json({ error: error.message });
	}
};

const productosPut = async (req, res) => {
	const { id } = req.params;
	const { nombre, codigo, descripcion, existencia, costo, venta, url, precioGestor } = req.body;

	try {
		// Verificar si el producto existe
		const productoExistente = await Producto.findById(id);
		if (!productoExistente) {
			return res.status(404).json({ msg: "Producto no encontrado" });
		}

		// Guardar valores anteriores para el registro en el historial
		const cambios = [];

		if (nombre !== undefined && nombre !== productoExistente.nombre) {
			cambios.push(`Nombre: ${productoExistente.nombre} -> ${nombre}`);
		}
		if (existencia !== undefined && existencia !== productoExistente.existencia) {
			cambios.push(`Existencia: ${productoExistente.existencia} -> ${existencia}`);
		}
		if (costo !== undefined && costo !== productoExistente.costo) {
			cambios.push(`Costo: ${productoExistente.costo} -> ${costo}`);
		}
		if (venta !== undefined && venta !== productoExistente.venta) {
			cambios.push(`Venta: ${productoExistente.venta} -> ${venta}`);
		}

		// Actualizar los campos del producto
		const camposActualizados = {
			nombre: nombre !== undefined ? nombre : productoExistente.nombre,
			codigo: codigo !== undefined ? codigo : productoExistente.codigo,
			descripcion: descripcion !== undefined ? descripcion : productoExistente.descripcion,
			existencia: existencia !== undefined ? existencia : productoExistente.existencia,
			costo: costo !== undefined ? costo : productoExistente.costo,
			venta: venta !== undefined ? venta : productoExistente.venta,
			precioGestor: precioGestor !== undefined ? precioGestor : productoExistente.precioGestor,
			url: url !== undefined ? url : productoExistente.url,
		};

		// Guardar los cambios en la base de datos
		const productoActualizado = await Producto.findByIdAndUpdate(id, camposActualizados, { new: true });

		// Registrar en el historial solo si hubo cambios
		if (cambios.length > 0) {
			const historial = new Historial({
				productoId: productoActualizado._id,
				accion: "ACTUALIZAR",
				detalles: `Actualizaciones: ${cambios.join(", ")}`,
				fecha: new Date(),
			});
			await historial.save();
		}

		// Responder con el producto actualizado
		res.status(200).json(productoActualizado);
	} catch (error) {
		console.error("Error al actualizar producto:", error);
		res.status(500).json({ error: "Error al actualizar el producto." });
	}
};

const getProductoPorId = async (req, res) => {
	try {
		const producto = await Producto.findById(req.params.id);
		if (!producto) {
			return res.status(404).json({ msg: "Producto no encontrado" });
		}
		res.json(producto);
	} catch (error) {
		console.error("Error al obtener el producto:", error);
		res.status(500).json({ msg: "Error del servidor", error: error.message });
	}
};

const productoDelete = async (req, res) => {
	const { id } = req.params;

	try {
		const producto = await Producto.findById(id);
		if (!producto) {
			return res.status(404).json({ msg: "Producto no encontrado" });
		}

		// Eliminar el producto de la colección
		await producto.deleteOne();
		res.status(200).json({ msg: "Producto eliminado" });
	} catch (error) {
		console.error("Error al eliminar producto:", error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	productosGet,
	productosGetAll,
	productosPut,
	productosPost,
	productoDelete,
	productosBuscar,
	getProductoPorId,
};
