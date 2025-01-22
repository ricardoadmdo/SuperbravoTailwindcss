const { Router } = require("express");
const {
	createUsuario,
	getUsuarios,
	updateUsuario,
	deleteUsuario,
	getUsuarioPorId,
} = require("../controllers/usuario.controller");

const router = Router();

// Crear un nuevo usuario
router.post("/", createUsuario);

// Obtener todos los usuarios
router.get("/", getUsuarios);

// Obtener 1 usuario por su id
router.get("/:id", getUsuarioPorId);

// Actualizar un usuario
router.put("/:id", updateUsuario);

// Eliminar un usuario
router.delete("/:id", deleteUsuario);

module.exports = router;
