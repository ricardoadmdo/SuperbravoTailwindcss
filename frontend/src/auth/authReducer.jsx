import { types } from '../types/types.jsx';

export const authReducer = (state = {}, action) => {
	switch (action.type) {
		case types.login:
			return {
				...state,
				nombre: action.payload.nombre,
				rol: action.payload.rol,
				logged: true,
			};
		case types.logout:
			return {
				logged: false,
			};
		default:
			return state;
	}
};
