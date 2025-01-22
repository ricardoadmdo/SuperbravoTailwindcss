const { Schema, model } = require('mongoose');

const GestorSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
});

GestorSchema.methods.toJSON = function () {
	const { __v, _id, ...gestor } = this.toObject();
	gestor.uid = _id;
	return gestor;
};

module.exports = model('Gestor', GestorSchema, 'gestores');
