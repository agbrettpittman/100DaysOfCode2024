import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper'
import App from '@/App.jsx'
import ErrorPage from '@/pages/ErrorPage.jsx'

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<App />} errorElement={<ErrorPage />} >
                <Route errorElement={<ErrorPage />} >
                    <Route index={true} element={<h1>Welcome!</h1>} />
                </Route>
            </Route>
        </Route>
    </Route>
)); 

export default MainRouter;