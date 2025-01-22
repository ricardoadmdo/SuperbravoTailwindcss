const { Router } = require("express");
const { login, createAdmin } = require("../controllers/auth.controller");

const router = Router();

// Ruta para iniciar sesión
router.post("/login", login);

// Ruta para crear un usuario administrador
router.post("/create-admin", createAdmin);

module.exports = router;
