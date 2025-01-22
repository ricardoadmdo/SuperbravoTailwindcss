const mongoose = require('mongoose');

const dbConnection = async () => {
	try {
		await mongoose.connect(`${process.env.MONGO_URI}`);

		console.log('🟢Base de Datos Online con MongoDB');
	} catch (error) {
		console.log(error);
		throw new Error('🔴Error al iniciar la Base de Datos!');
	}
};

module.exports = {
	dbConnection,
};
