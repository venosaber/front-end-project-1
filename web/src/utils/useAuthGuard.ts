import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie, isTokenExpired, refreshToken } from "./auth.ts";

export const useAuthGuard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            let aToken: string | null = getCookie("accessToken");

            // if there is no accessToken or accessToken is expired, try to refresh tokens
            if (!aToken || isTokenExpired(aToken)) {
                try {
                    aToken = await refreshToken();
                } catch (err) {
                    console.error("Cannot refresh token:", err);
                    navigate("/login");
                    return;
                }
            }

            setAccessToken(aToken);
            setLoading(false);
        };

        checkToken();
    }, [navigate]);

    return { loading, accessToken };
};