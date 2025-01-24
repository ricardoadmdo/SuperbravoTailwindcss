import useAuthStore from "../auth/authStore";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
	const { user } = useAuthStore();
	const { pathname, search } = useLocation();

	localStorage.setItem("lastPath", pathname + search);

	return user.logged ? children : <Navigate to="/not-found" />;
};

PrivateRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default PrivateRoute;
