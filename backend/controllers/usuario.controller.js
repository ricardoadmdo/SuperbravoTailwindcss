const { response, request } = require("express");
const bcryptjs = require("bcryptjs");
const Usuario = require("../models/usuario");

const createUsuario = async (req, res) => {
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		// Verificar si el nombre de usuario ya existe
		const usuarioExistente = await Usuario.findOne({ usuario });
		if (usuarioExistente) {
			return res.status(400).json({ error: "El nombre de usuario ya está en uso." });
		}

		// Encriptar la contraseña
		const salt = bcryptjs.genSaltSync();
		const hashedPassword = bcryptjs.hashSync(contrasena, salt);

		const newUsuario = new Usuario({
			nombre,
			contrasena: hashedPassword,
			usuario,
			rol,
		});

		await newUsuario.save();
		res.status(201).json(newUsuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getUsuarios = async (req, res) => {
	try {
		const { limit = 8, page = 1, search } = req.query;
		const offset = (page - 1) * limit;

		const query = {};
		if (search) {
			query.nombre = new RegExp(search, "i"); // Búsqueda insensible a mayúsculas
		}

		const [total, usuarios] = await Promise.all([
			Usuario.countDocuments(query),
			Usuario.find(query).skip(offset).limit(Number(limit)),
		]);

		res.json({
			total,
			usuarios,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error al obtener los usuarios:", error);
		res.status(500).json({
			msg: "Error al obtener los usuarios",
			error: error.message,
		});
	}
};

const getUsuarioPorId = async (req, res) => {
	try {
		const usuario = await Usuario.findById(req.params.id);
		if (!usuario) {
			return res.status(404).json({ msg: "Usuario no encontrado" });
		}
		res.json(usuario);
	} catch (error) {
		console.error("Error al obtener el usuario:", error);
		res.status(500).json({ msg: "Error del servidor", error: error.message });
	}
};

const updateUsuario = async (req, res) => {
	const { id } = req.params;
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		// Buscar el usuario por su ID
		const usuarioExistente = await Usuario.findById(id);
		if (!usuarioExistente) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		// No permitir cambiar el rol de un administrador
		if (usuarioExistente.rol === "Administrador" && rol && rol !== "Administrador") {
			return res.status(400).json({ error: "No se puede cambiar el rol de un Administrador" });
		}

		// Verificar si el nombre de usuario ya está en uso por otro usuario
		const usuarioDuplicado = await Usuario.findOne({ usuario, _id: { $ne: id } });
		if (usuarioDuplicado) {
			return res.status(400).json({ error: "El nombre de usuario ya está en uso. Por favor, elige otro." });
		}

		// Actualizar los campos solo si están presentes en el cuerpo de la solicitud
		usuarioExistente.nombre = nombre !== undefined ? nombre : usuarioExistente.nombre;
		if (contrasena !== undefined) {
			// Encriptar la nueva contraseña si se proporciona
			const salt = bcryptjs.genSaltSync();
			usuarioExistente.contrasena = bcryptjs.hashSync(contrasena, salt);
		}
		usuarioExistente.usuario = usuario !== undefined ? usuario : usuarioExistente.usuario;
		usuarioExistente.rol = rol !== undefined ? rol : usuarioExistente.rol;

		// Guardar los cambios
		await usuarioExistente.save();
		res.status(200).json(usuarioExistente);
	} catch (error) {
		// Capturar el error de MongoDB en caso de duplicado y devolver un mensaje claro
		if (error.code === 11000) {
			return res.status(400).json({ error: "El nombre de usuario ya está en uso. Por favor, elige otro." });
		}

		// En caso de otro tipo de error
		res.status(500).json({ error: error.message });
	}
};
const deleteUsuario = async (req, res) => {
	const { id } = req.params;
	const { currentUser } = req.body; // Usuario actual enviado desde el frontend

	try {
		const usuario = await Usuario.findById(id);

		if (!usuario) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		// Verificar si el usuario a eliminar es Administrador
		if (usuario.rol === "Administrador") {
			// Solo permitir si el usuario actual es 'dev'
			if (currentUser !== "Developer") {
				return res.status(403).json({ message: "No se puede eliminar un Administrador." });
			}
		}

		// Proceder con la eliminación
		await usuario.deleteOne();
		res.status(200).json({ message: "Usuario eliminado" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createUsuario,
	getUsuarios,
	updateUsuario,
	deleteUsuario,
	getUsuarioPorId,
};
