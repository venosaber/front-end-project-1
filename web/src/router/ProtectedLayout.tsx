import {useEffect, useState} from "react";
import {getValidAccessToken} from "./auth.ts";
import {Navigate, Outlet} from "react-router-dom";
import {CheckingAuth} from "../components";

export default function ProtectedLayout() {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token: string | null = await getValidAccessToken();
            setIsAuthenticated(!!token);
            setIsChecking(false);
        }

        checkAuth();
    },[]);

    if(isChecking) return <CheckingAuth />;
    if(!isAuthenticated){
        return <Navigate to="/login" />
    }

    return <Outlet />
}