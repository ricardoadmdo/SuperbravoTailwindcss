import axios from 'axios';

const instance = axios.create({
	baseURL:
		import.meta.env.MODE === 'production'
			? import.meta.env.VITE_API_URL_PRODUCTION
			: import.meta.env.VITE_API_URL_DEVELOPMENT,
});

export default instance;
