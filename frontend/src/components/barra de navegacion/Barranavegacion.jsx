import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./barranavegacion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faSignOutAlt,
	faFileInvoice,
	faCashRegister,
	faBoxes,
	faUserCog,
	faChartLine,
	faSun,
	faMoon,
} from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../../auth/authStore";
import PropTypes from "prop-types";

const Barranavegacion = ({ darkMode, setDarkMode }) => {
	const navigate = useNavigate();
	const { user, logout } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);

	const sidebarRef = useRef(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [darkMode]);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	const handleLogout = () => {
		logout(); // Llama a la acción logout de Zustand
		navigate("/", { replace: true });
	};

	const handleClickOutside = (event) => {
		if (
			sidebarRef.current &&
			!sidebarRef.current.contains(event.target) &&
			buttonRef.current &&
			!buttonRef.current.contains(event.target)
		) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<>
			<nav className={`navbar navbar-expand-lg ${isOpen ? "shifted" : ""}`}>
				<div className="container-fluid d-flex align-items-center">
					<button className="menu-btn" type="button" onClick={toggleSidebar} ref={buttonRef}>
						☰
					</button>
					<span className="navbar-brand mb-0 h1 d-flex align-items-center">
						<NavLink className="navbar-brand" to="/reporte-venta">
							Servicios Bravo
						</NavLink>
					</span>

					<ul className="navbar-nav">
						{/* Botón para alternar modo oscuro */}
						<li className="nav-item me-3">
							<button onClick={toggleDarkMode} className="btn btn-sm text-light bg-transparent">
								<FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
							</button>
						</li>

						{user.logged ? (
							<li className="nav-item">
								<span>{user.nombre}</span>
								<button className="nav-link" onClick={handleLogout}>
									<FontAwesomeIcon icon={faSignOutAlt} />
									Cerrar Sesión
								</button>
							</li>
						) : (
							<li className="nav-item">
								<NavLink className="nav-link" to="/reporte-venta">
									<FontAwesomeIcon icon={faUser} />
									Iniciar Sesión
								</NavLink>
							</li>
						)}
					</ul>
				</div>
			</nav>
			<div ref={sidebarRef} className={`d-flex flex-column vh-100 sidebar mt-4 ${isOpen ? "open" : ""}`}>
				<nav className="nav flex-column mt-3">
					<NavLink to="/agregar-venta" className="nav-link">
						<FontAwesomeIcon icon={faCashRegister} className="me-2" />
						Registrar Ventas
					</NavLink>

					<NavLink to="/reporte-venta" className="nav-link">
						<FontAwesomeIcon icon={faFileInvoice} className="me-2" />
						Reporte de Ventas
					</NavLink>

					<NavLink to="/gestionar-gestores" className="nav-link">
						<FontAwesomeIcon icon={faUserCog} className="me-2" />
						Gestionar Gestores
					</NavLink>

					<NavLink to="/resumenProductos" className="nav-link">
						<FontAwesomeIcon icon={faBoxes} className="me-2" />
						Inventario
					</NavLink>

					{user.rol === "Administrador" && (
						<>
							<div className="mt-3 px-3">
								<h6 className="text-uppercase text-secondary fw-bold">Opciones de Administrador</h6>
							</div>
							<div className="dropdown-divider"></div>
							<NavLink to="/gestionar-productos" className="nav-link">
								<FontAwesomeIcon icon={faBoxes} className="me-2" />
								Gestionar Productos
							</NavLink>
							<NavLink to="/gestionar-usuarios" className="nav-link">
								<FontAwesomeIcon icon={faUserCog} className="me-2" />
								Gestionar Usuarios
							</NavLink>

							<div className="mt-3 px-3">
								<h6 className="text-uppercase text-secondary fw-bold">Gráficos Estadísticos</h6>
							</div>
							<NavLink to="/grafico-ventas" className="nav-link">
								<FontAwesomeIcon icon={faChartLine} className="me-2" />
								Gráficos de Ventas
							</NavLink>
							<NavLink to="/grafico-venta-gestores" className="nav-link">
								<FontAwesomeIcon icon={faChartLine} className="me-2" />
								Gráfico más ventas por gestor
							</NavLink>
							<NavLink to="/grafico-productos-mas-vendidos" className="nav-link">
								<FontAwesomeIcon icon={faChartLine} className="me-2" />
								Gráfico productos mas vendidos
							</NavLink>
							<NavLink to="/grafico-productos-dia" className="nav-link">
								<FontAwesomeIcon icon={faChartLine} className="me-2" />
								Gráfico productos vendidos hoy
							</NavLink>
						</>
					)}
				</nav>
			</div>
			<div className={`content ${isOpen ? "shifted" : ""}`}></div>
		</>
	);
};

Barranavegacion.propTypes = {
	darkMode: PropTypes.bool.isRequired,
	setDarkMode: PropTypes.func.isRequired,
};

export default Barranavegacion;
