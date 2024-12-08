import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@': '/src',
            '@pages': '/src/pages',
            '@utilities': '/src/utilities',
            '@components': '/src/components',
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
})
