import {jwtDecode} from "jwt-decode";
import {postMethod} from "./api.ts";

interface DecodedJWT {
    exp: number;
}

export const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

export const setCookie = (name: string, value: string, maxAge: number) => {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; secure; samesite=strict`;
};

export const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const { exp } = jwtDecode<DecodedJWT>(token);
        const now: number = Date.now() / 1000;
        return exp < now;
    } catch (e) {
        return true;
    }
};

export const refreshToken = async () => {
    const refreshToken: string | null = getCookie('refreshToken');
    if (!refreshToken) throw new Error('No refreshToken');

    try {
        const payload = { refresh: refreshToken }
        const {access: newAccessToken, refresh: newRefreshToken } = await postMethod('/login/get_new_token', payload);

        setCookie('accessToken', newAccessToken, 15 * 60); // 15 minutes
        setCookie('refreshToken', newRefreshToken, 7 * 24 * 60 * 60); // a week
        return newAccessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw new Error('Failed to refresh token');
    }
};

export const getUserInfo = (token: string) => {
    try {
        return jwtDecode<any>(token);
    } catch (e) {
        return null;
    }
}
