const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
	contrasena: {
		type: String,
		required: [true, 'El password es obligatorio'],
	},
	usuario: {
		type: String,
		required: [true, 'El usuario es obligatorio'],
		unique: true,
	},
	rol: {
		type: String,
		required: true,
		emun: ['ADMIN_ROLE', 'USER_ROLE'],
	},
});

UsuarioSchema.methods.toJSON = function () {
	const { __v, password, _id, ...usuario } = this.toObject();
	usuario.uid = _id;
	return usuario;
};

module.exports = model('Usuario', UsuarioSchema);
