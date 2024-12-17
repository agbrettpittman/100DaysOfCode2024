import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
instance.defaults.baseURL = import.meta.env.VITE_APP_API_BASE;
const requestor = setupCache(instance);
export default requestor;