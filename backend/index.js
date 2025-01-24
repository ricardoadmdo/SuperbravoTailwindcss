// Importaciones
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { dbConnection } = require("./database/config.js");

// Inicializar app y servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://superbravo.es"],
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});

// Conectar a la base de datos
dbConnection();

// Configuración de CORS
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://superbravo.es"];
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg = "The CORS policy for this site does not allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Lectura y parseo del body
app.use(express.json());

// Configuración de Socket.IO
io.on("connection", (socket) => {
	console.log("🟢 Nuevo cliente conectado: ", socket.id);

	socket.on("disconnect", () => {
		console.log("🔴 Cliente desconectado: ", socket.id);
	});
});

// Agregar el objeto `io` al `req` para usarlo en los controladores
app.use((req, res, next) => {
	req.io = io;
	next();
});

// Configuración de Multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "uploads")); // Carpeta donde se almacenarán las imágenes
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para evitar conflictos
	},
});

const upload = multer({ storage });

// Servir archivos estáticos desde la carpeta "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas principales
app.use("/api/usuarios", require("./routes/usuario.routes.js"));
app.use("/api/productos", require("./routes/producto.routes.js"));
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/venta", require("./routes/venta.routes.js"));
app.use("/api/gestor", require("./routes/gestor.routes.js"));
app.use("/api/historial", require("./routes/historial.routes.js"));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`🟢 Backend corriendo en el puerto: ${PORT}`);
});
