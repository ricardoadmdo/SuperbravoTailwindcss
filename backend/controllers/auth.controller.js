const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

// Función para iniciar sesión
const login = async (req, res) => {
	const { usuario, contrasena } = req.body;

	try {
		const user = await Usuario.findOne({ usuario });

		if (!user) {
			return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
		}

		const isMatch = await bcryptjs.compare(contrasena, user.contrasena);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
		}

		res.json({
			success: true,
			message: 'Inicio de sesión exitoso',
			nombre: user.nombre,
			rol: user.rol,
		});
	} catch (error) {
		console.error('Error durante la autenticación:', error);
		res.status(500).json({ success: false, message: 'Error durante la autenticación' });
	}
};

// Función para crear un usuario administrador
const createAdmin = async (req, res) => {
	const { usuario, contrasena, nombre, rol } = req.body;

	try {
		// Verifica si el usuario ya existe
		const existingUser = await Usuario.findOne({ usuario });
		if (existingUser) {
			return res.status(400).json({ success: false, message: 'Ese usuario ya existe' });
		}

		// Encripta la contraseña
		const hashedPassword = await bcryptjs.hash(contrasena, 10);

		// Crea el nuevo usuario
		const newUser = new Usuario({
			usuario,
			contrasena: hashedPassword,
			nombre,
			rol,
		});

		await newUser.save();

		res.status(201).json({ success: true, message: 'Usuario administrador creado con éxito.' });
	} catch (error) {
		console.error('Error al crear el usuario administrador:', error);
		res.status(500).json({ success: false, message: 'Error al crear el usuario administrador.' });
	}
};

module.exports = { login, createAdmin };
