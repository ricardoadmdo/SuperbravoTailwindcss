const { response, request } = require('express');
const Gestor = require('../models/gestor');

// Crear un nuevo gestor
const createGestor = async (req, res) => {
	const { nombre } = req.body;

	try {
		const nuevoGestor = new Gestor({ nombre });
		await nuevoGestor.save();
		res.status(201).json(nuevoGestor);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Obtener todos los gestores
const getGestores = async (req, res) => {
	try {
		const { limit = 8, page = 1, search } = req.query;
		const offset = (page - 1) * limit;

		const query = {};
		if (search) {
			query.nombre = new RegExp(search, 'i'); // Búsqueda insensible a mayúsculas
		}

		const [total, gestores] = await Promise.all([
			Gestor.countDocuments(query),
			Gestor.find(query).skip(offset).limit(Number(limit)),
		]);

		res.json({
			total,
			gestores,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error('Error al obtener los gestores:', error);
		res.status(500).json({
			msg: 'Error al obtener los gestores',
			error: error.message,
		});
	}
};

// Obtener un gestor por su ID
const getGestorPorId = async (req, res) => {
	try {
		const gestor = await Gestor.findById(req.params.id);
		if (!gestor) {
			return res.status(404).json({ msg: 'Gestor no encontrado' });
		}
		res.json(gestor);
	} catch (error) {
		console.error('Error al obtener el gestor:', error);
		res.status(500).json({ msg: 'Error del servidor', error: error.message });
	}
};

// Actualizar un gestor
const updateGestor = async (req, res) => {
	const { id } = req.params;
	const { nombre } = req.body;

	try {
		// Buscar el gestor por su ID
		const gestorExistente = await Gestor.findById(id);
		if (!gestorExistente) {
			return res.status(404).json({ message: 'Gestor no encontrado' });
		}

		// Verificar si el nombre ya está en uso por otro gestor
		const gestorDuplicado = await Gestor.findOne({ nombre, _id: { $ne: id } });
		if (gestorDuplicado) {
			return res.status(400).json({ error: 'El nombre del gestor ya está en uso. Por favor, elige otro.' });
		}

		// Actualizar los campos solo si están presentes en el cuerpo de la solicitud
		gestorExistente.nombre = nombre !== undefined ? nombre : gestorExistente.nombre;

		// Guardar los cambios
		await gestorExistente.save();
		res.status(200).json(gestorExistente);
	} catch (error) {
		// Capturar el error de MongoDB en caso de duplicado y devolver un mensaje claro
		if (error.code === 11000) {
			return res.status(400).json({ error: 'El nombre del gestor ya está en uso. Por favor, elige otro.' });
		}

		// En caso de otro tipo de error
		res.status(500).json({ error: error.message });
	}
};

// Eliminar un gestor
const deleteGestor = async (req, res) => {
	const { id } = req.params;

	try {
		const gestor = await Gestor.findById(id);
		if (gestor) {
			await gestor.deleteOne();
			res.status(200).json({ message: 'Gestor eliminado' });
		} else {
			res.status(404).json({ message: 'Gestor no encontrado' });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createGestor,
	getGestores,
	updateGestor,
	deleteGestor,
	getGestorPorId,
};
