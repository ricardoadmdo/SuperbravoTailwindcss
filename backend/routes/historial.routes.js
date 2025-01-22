const { Router } = require("express");
const { getHistorialPorProducto } = require("../controllers/historial.controller");

const router = Router();

// Obtener el historial completo de un producto
router.get("/producto/:productoId", getHistorialPorProducto);

module.exports = router;
