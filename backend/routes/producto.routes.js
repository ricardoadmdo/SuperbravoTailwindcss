const { Router } = require("express");
const {
	productosPost,
	productosGet,
	productosPut,
	productoDelete,
	getProductoPorId,
	productosBuscar,
	productosGetAll,
} = require("../controllers/producto.controller");

const router = Router();

// Crear un nuevo Producto
router.post("/", productosPost);

// Obtener todos los Producto
router.get("/", productosGet);

// Obtener todos los Producto con Paginacion
router.get("/all", productosGetAll);

// Obtener 1 producto por su id
router.get("/:id", getProductoPorId);

// Buscar producto por su Nombre
router.get("/", productosBuscar);

// Actualizar un Producto
router.put("/:id", productosPut);

// Eliminar un Producto
router.delete("/:id", productoDelete);

module.exports = router;
