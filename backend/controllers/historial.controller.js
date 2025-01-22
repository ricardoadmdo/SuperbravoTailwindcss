const Historial = require("../models/historial");

// Obtener historial por producto
const getHistorialPorProducto = async (req, res) => {
	const { productoId } = req.params;
	const { page = 1, limit = 10 } = req.query; // Valores por defecto
	const skip = (page - 1) * limit;

	try {
		const historial = await Historial.find({ productoId })
			.sort({ fecha: -1 }) // Orden por fecha descendente
			.skip(Number(skip))
			.limit(Number(limit));

		const totalHistorial = await Historial.countDocuments({ productoId });

		res.status(200).json({
			historial,
			totalPages: Math.ceil(totalHistorial / limit),
		});
	} catch (error) {
		console.error("Error al obtener el historial:", error);
		res.status(500).json({ message: "Error al obtener el historial." });
	}
};

module.exports = {
	getHistorialPorProducto,
};
