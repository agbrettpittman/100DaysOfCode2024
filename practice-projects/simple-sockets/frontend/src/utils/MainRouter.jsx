import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper';
import App from '@/App.jsx';
import ErrorPage from '@pages/ErrorPage';
import Root from "@pages/RootPage";
import NotFound from "@pages/NotFound";
import LoginPage from "@pages/LoginPage";
import RoomPage from "@pages/RoomPage";
import RoomEditPage from "@pages/RoomEditPage";

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<App />} errorElement={<ErrorPage />} >
                <Route errorElement={<ErrorPage />} >
                    <Route index={true} element={<Root />} />
                    <Route path="rooms">
                        <Route index={true} element={<Navigate to="/" />} />
                        <Route path=":id" element={<RoomSubRouter />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
            <Route path="login" element={<LoginPage />} />
        </Route>
    </Route>
)); 

function RoomSubRouter() {
    const CurrentUser = localStorage.getItem('username')
    if (CurrentUser === 'admin') return <RoomEditPage />
    else return <RoomPage />
}

export default MainRouter;