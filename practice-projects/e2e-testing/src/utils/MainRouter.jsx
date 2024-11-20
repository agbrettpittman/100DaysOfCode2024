import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper'
import App from '@/App.jsx'
import ErrorPage from '@pages/ErrorPage'
import Root from "@pages/RootPage";
import CharacterPage from "@pages/CharacterPage";
import CharacterEditPage from "@pages/CharacterEditPage";
import NotFound from "@pages/NotFound";
import LoginPage from "@pages/LoginPage";

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<App />} errorElement={<ErrorPage />} >
                <Route errorElement={<ErrorPage />} >
                    <Route index={true} element={<Root />} />
                    <Route path="characters">
                        <Route index={true} element={<Navigate to="/" />} />
                        <Route path=":id">
                            <Route index={true} element={<CharacterPage />} />
                            <Route path="edit" element={<CharacterEditPage />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
            <Route path="login" element={<LoginPage />} />
        </Route>
    </Route>
)); 

export default MainRouter;