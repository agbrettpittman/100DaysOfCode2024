import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-toastify/dist/ReactToastify.css';
import MainRouter from './MainRouter';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_APP_API_BASE;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={MainRouter} />
  </StrictMode>,
)