import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper'
import App from '@/App.jsx'
import ErrorPage from '@pages/ErrorPage'
import Root from "@pages/RootPage";
import CharacterPage from "@pages/CharacterPage";
import NotFound from "@pages/NotFound";

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<App />} errorElement={<ErrorPage />} >
                <Route errorElement={<ErrorPage />} >
                    <Route index={true} element={<Root />} />
                    <Route path="Characters" element={<CharacterPage />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Route>
    </Route>
)); 

export default MainRouter;