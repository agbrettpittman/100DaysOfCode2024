import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate,
    useParams,
    Routes
} from "react-router-dom";
import ThemeWrapper from '@/ThemeWrapper'
import App from '@/App.jsx'
import ErrorPage from '@pages/ErrorPage'
import Root from "@pages/RootPage";
import CharacterPage from "@pages/CharacterPage";
import CharacterEditPage from "@pages/CharacterEditPage";
import NotFound from "@pages/NotFound";
import LoginPage from "@pages/LoginPage";
import { useEffect, useState } from "react";
import UnauthorizedPage from "@pages//UnauthorizedPage";
import axios from "axios";
import { toast } from "react-toastify";

const MainRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" errorElement={<ErrorPage />}>
        <Route element={<ThemeWrapper />}>
            <Route element={<App />} errorElement={<ErrorPage />} >
                <Route errorElement={<ErrorPage />} >
                    <Route index={true} element={<Root />} />
                    <Route path="characters">
                        <Route index={true} element={<Navigate to="/" />} />
                        <Route path=":id" element={<CharacterProtectionRoute />} />
                        <Route path=":id/*" element={<CharacterProtectionRoute />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
            <Route path="login" element={<LoginPage />} />
        </Route>
    </Route>
)); 

function CharacterProtectionRoute() {
    const { id } = useParams();
    const [Authorized, setAuthorized] = useState(null);

    useEffect(() => {
        axios.get(`/characters/${id}`).then((response) => {
            if (response.data.creator === localStorage.getItem('username')) {
                setAuthorized(true);
            } else {
                setAuthorized(false);
            }
        }).catch((error) => {
            console.error(error);
            setAuthorized(false);
            toast.error('Could not verify character ownership');
        })
    }, [id]);

    if (Authorized === null) return null;
    else if (Authorized === false) return <UnauthorizedPage />;
    else return (
        <Routes>
            <Route index={true} element={<CharacterPage />} />
            <Route path="edit" element={<CharacterEditPage />} />
        </Routes>
    )

}

export default MainRouter;