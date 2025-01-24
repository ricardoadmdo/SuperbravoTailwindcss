import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import useAuthStore from "../auth/authStore";

const AdminRoute = ({ children }) => {
	const { user } = useAuthStore();
	const location = useLocation();

	return user.logged && user.rol === "Administrador" ? (
		children
	) : (
		<Navigate to="/not-found" state={{ from: location }} replace />
	);
};

AdminRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AdminRoute;
