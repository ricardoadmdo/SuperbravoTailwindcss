import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const GestoresSkeleton = () => {
	const rows = Array.from({ length: 8 });

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>
				<Skeleton width={250} />
			</h2>
			<div className='text-center mb-4'>
				<Skeleton width={200} height={40} />
			</div>
			<div className='table-responsive'>
				<table className='table table-striped table-bordered'>
					<thead className='thead-dark'>
						<tr>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={100} />
							</th>
							<th>
								<Skeleton width={150} />
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((_, index) => (
							<tr key={index}>
								<td>
									<Skeleton />
								</td>
								<td>
									<Skeleton />
								</td>
								<td>
									<Skeleton />
								</td>
								<td className='d-flex justify-content-between'>
									<Skeleton width={100} height={36} />
									<Skeleton width={100} height={36} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default GestoresSkeleton;
