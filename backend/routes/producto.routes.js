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
const multer = require("multer");
const path = require("path");

// Configurar Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "../uploads")); // Carpeta donde se guardarán las imágenes
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para evitar conflictos
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		// Validar que el archivo sea una imagen
		if (!file.mimetype.startsWith("image/")) {
			return cb(new Error("Solo se permiten archivos de imagen."));
		}
		cb(null, true);
	},
});

// Crear un nuevo Producto
router.post("/", upload.single("file"), productosPost);

// Obtener todos los Producto
router.get("/", productosGet);

// Obtener todos los Producto con Paginacion
router.get("/all", productosGetAll);

// Buscar producto por su Nombre
router.get("/", productosBuscar);

// Obtener 1 producto por su id
router.get("/:id", getProductoPorId);

// Actualizar un Producto
router.put("/:id", upload.single("file"), productosPut);

// Eliminar un Producto
router.delete("/:id", productoDelete);

module.exports = router;
