import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PropTypes from "prop-types";

const BuscarProductoSkeleton = ({ lines = 5 }) => {
	return (
		<div className="list-group">
			{Array.from({ length: lines }).map((_, index) => (
				<div key={index} className="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<Skeleton width={200} height={20} />
						<Skeleton width={150} height={15} style={{ marginTop: 5 }} />
					</div>
					<div>
						<Skeleton width={90} height={30} />
					</div>
				</div>
			))}
		</div>
	);
};

BuscarProductoSkeleton.propTypes = {
	lines: PropTypes.number,
};

export default BuscarProductoSkeleton;
