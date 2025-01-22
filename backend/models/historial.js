const { Schema, model } = require("mongoose");

const HistorialSchema = Schema({
	productoId: {
		type: Schema.Types.ObjectId,
		ref: "Producto",
		required: true,
	},
	accion: {
		type: String,
		enum: ["CREAR", "ACTUALIZAR", "ELIMINAR"],
		required: true,
	},
	detalles: {
		type: String,
		required: false,
	},
	cantidad: {
		type: Number,
		required: false,
	},
	precios: {
		costo: { type: Number, required: false },
		venta: { type: Number, required: false },
		precioGestor: { type: Number, required: false },
	},
	fecha: {
		type: Date,
		required: true,
		default: Date.now,
	},
	usuario: {
		type: String, // Puedes guardar el nombre o ID del usuario/gestor
		required: false,
	},
});

module.exports = model("Historial", HistorialSchema);
