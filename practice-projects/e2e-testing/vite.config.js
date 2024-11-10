import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
            '@pages': '/src/pages',
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
})
