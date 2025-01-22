const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { dbConnection } = require("./database/config.js");
require("dotenv").config();

// Crear el servidor de Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://superbravo.es"],
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});

// Base de Datos
dbConnection();

// CORS
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

// Configurar Socket.IO para manejar conexiones
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

// Rutas
app.use("/api/usuarios", require("./routes/usuario.routes.js"));
app.use("/api/productos", require("./routes/producto.routes.js"));
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/venta", require("./routes/venta.routes.js"));
app.use("/api/gestor", require("./routes/gestor.routes.js"));
app.use("/api/historial", require("./routes/historial.routes.js"));

// Escuchar peticiones
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`🟢 Backend corriendo en el puerto: ${PORT}`);
});
