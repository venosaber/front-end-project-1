import {jwtDecode} from "jwt-decode";
import {postMethod} from "../utils/api.ts";

interface DecodedJWT {
    exp: number;
}

/******* Cookie Utils *******/
export const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

export const setCookie = (name: string, value: string, maxAgeInSeconds?: number) => {
    let cookieString: string = `${name}=${value}; path=/; secure; samesite=strict`;
    if(maxAgeInSeconds){
        cookieString += `; max-age=${maxAgeInSeconds}`;
    }
    document.cookie = cookieString;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
};

/******** JWT utils ********/
export const isTokenExpired = (token: string): boolean => {
    try {
        const { exp } = jwtDecode<DecodedJWT>(token);
        const now: number = Date.now() / 1000;
        return exp < now;
    } catch (e) {
        return true;
    }
};

export const getUserInfo = (token: string) => {
    try {
        return jwtDecode<any>(token);
    } catch (e) {
        return null;
    }
}


/********** Token refreshing && Validation **********/
export const refreshToken = async () => {
    const refreshToken: string | null = getCookie('refreshToken');
    if (!refreshToken) throw new Error('No refreshToken');

    try {
        const payload = { refresh: refreshToken }
        const {access: newAccessToken, refresh: newRefreshToken } = await postMethod('/login/get_new_token', payload);

        setCookie('accessToken', newAccessToken, 15 * 60); // 15 minutes

        // Conditionally set refreshToken depending on rememberMe
        if (newRefreshToken) {
            if (localStorage.getItem('rememberMe') === 'true') {
                setCookie('refreshToken', newRefreshToken, 7 * 24 * 60 * 60); // 7 days
            } else {
                setCookie('refreshToken', newRefreshToken); // session cookie
            }
        }

        return newAccessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Failed to refresh token');
    }
};

/*
 * check if there is an accessToken
 * if there isn't, or the accessToken is expired, try to refresh tokens
 */
export const getValidAccessToken = async () => {
    const accessToken: string | null = getCookie('accessToken');
    if (!accessToken || isTokenExpired(accessToken)) {
        try {
            return await refreshToken();
        } catch (err) {
            console.error('Cannot refresh token:', err);
            return null;
        }
    }
    return accessToken;
}


