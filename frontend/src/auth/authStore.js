import { create } from "zustand";

// Definir la store para la autenticación
const useAuthStore = create((set) => ({
	user: JSON.parse(localStorage.getItem("user")) || { logged: false },

	// Acción para iniciar sesión
	login: (credentials) =>
		set(() => {
			const user = {
				nombre: credentials.nombre,
				rol: credentials.rol,
				logged: true,
			};
			localStorage.setItem("user", JSON.stringify(user));
			return { user };
		}),

	// Acción para cerrar sesión
	logout: () =>
		set(() => {
			localStorage.removeItem("user");
			return { user: { logged: false } };
		}),
}));

export default useAuthStore;
