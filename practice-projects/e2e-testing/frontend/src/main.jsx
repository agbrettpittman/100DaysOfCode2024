import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import MainRouter from './utils/MainRouter';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={MainRouter} />
  </StrictMode>,
)
