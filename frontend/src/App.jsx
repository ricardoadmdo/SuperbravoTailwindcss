import { useState, useEffect } from "react";
import AppRouter from "./routes/AppRouter";

function App() {
	// Estado para manejar el modo oscuro
	const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

	// Actualiza las clases de la raíz según el modo oscuro
	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [darkMode]);

	return (
		<div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
			{/* Renderiza el AppRouter y pasa el control del dark mode */}
			<AppRouter darkMode={darkMode} setDarkMode={setDarkMode} />
		</div>
	);
}

export default App;
