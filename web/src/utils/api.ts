import api from '../plugins/api.ts'
import type {AxiosRequestConfig} from "axios";

export const getMethod = async (endpoint: string, config?: AxiosRequestConfig) => {
    try{
        const {data} = await api.get(endpoint, config ?? {});
        return data;
    }catch(e){
        console.log(e);
    }

    return null;
}

export const postMethod = async (endpoint: string, payload: any, config?: AxiosRequestConfig) => {
    try{
        const {data} = await api.post(endpoint, payload, config ?? {});
        return data;
    }catch(e){
        console.log(e);
    }

    return null;
}

export const putMethod = async (endpoint: string, payload: any, config?: AxiosRequestConfig) => {
    try {
        const {data} = await api.put(endpoint, payload, config ?? {});
        return data;
    } catch (e) {
        console.log(e);
    }

    return null;
}

export const deleteMethod = async (endpoint: string, config?: AxiosRequestConfig) => {
    try {
        const {data} = await api.delete(endpoint, config ?? {});
        return data;
    } catch (e) {
        console.log(e);
    }

    return null;
}