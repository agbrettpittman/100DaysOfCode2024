import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate,
    Routes
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper';
import App from '@/App.jsx';
import ErrorPage from '@pages/ErrorPage';
import LandingPage from "@pages/LandingPage";
import NotFoundPage from "@pages/NotFoundPage";
import LoginPage from "@pages/LoginPage";
import EventPage from "@pages/EventPage";
import EventForm from "@components/EventForm";

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route path="login" element={<LoginPage />} />
            <Route index={true} element={<RouteProtector />} />
            <Route path="*" element={<RouteProtector />} />
        </Route>
    </Route>
)); 

function RouteProtector() {
    const CurrentUser = localStorage.getItem('username')
    if (!CurrentUser) return <Navigate to="/login" />
    return (
        <Routes>
            <Route element={<App />}>
                <Route index={true} element={<LandingPage />} />
                    <Route path="events"  >
                        <Route index={true} element={<Navigate to="/" />} />
                        <Route path=":id">
                            <Route index={true} element={<EventPage />}/>
                            <Route path="edit" element={<EventForm />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
        </Routes>
    )
}

export default MainRouter;