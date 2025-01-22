const { Router } = require("express");
const {
	createGestor,
	getGestores,
	updateGestor,
	deleteGestor,
	getGestorPorId,
} = require("../controllers/gestor.controller");

const router = Router();

// Crear un nuevo Gestor
router.post("/", createGestor);

// Obtener todos los Gestores
router.get("/", getGestores);

// Obtener 1 Gestor por su id
router.get("/:id", getGestorPorId);

// Actualizar un Gestor
router.put("/:id", updateGestor);

// Eliminar un Gestor
router.delete("/:id", deleteGestor);

module.exports = router;
