import axios from "axios";
import { createUrl } from './utils';


export const apiClient = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL // <- ENV variable
});


 
apiClient.interceptors.request.use((config) => { 

    // perform a task before the request is sent 
    const jwt = localStorage.getItem("jwt");
    if (jwt)
        config.headers.authorization = `Bearer ${jwt}`;

    config.timeout = 10000// ENV value....
    console.log(config)

    return config;
});

apiClient.interceptors.response.use((response) => {

    return response;

});

const logout = () => {
    localStorage.removeItem("jwt")
    localStorage.removeItem("agent")
    document.location.reload()
}


export const get = async (url, queryParams, options = {}) => {
    if (!url)
        return Promise.reject({ status: 400 })

    if (queryParams)
        url = createUrl(url, queryParams)

    const promisecallback = async (resolve, reject) => {
        try {

            const response = await apiClient.get(url, options)
            return resolve(response)

        } catch (error) {

            if (!error)
                return reject({ status: 500, message: 'Response not received from Server' })

            const errorResponse = error.response || {}
            if (['JWT_EXPIRED', 'REFRESH_JWT_EXPIRED'].includes(errorResponse.message)) {
                return logout()
            }

            return reject(errorResponse)
        }
    }
    return new Promise(promisecallback)
}

export const post = async (url, payload, options = {}) => {
    if (!url) return Promise.reject({ status: 400 })

    if (!options.headers) {
        options.headers = {}
        options.headers["Content-Type"] = "application/json"
    }


    const promisecallback = async (resolve, reject) => {
        try {
            const response = await apiClient.post(url, payload, options)
            return resolve(response)

        } catch (error) {

            if (!error)
                return reject({ status: 500, message: 'Response not received from Server' })

            const errorResponse = error.response || {}
            if (['JWT_EXPIRED', 'REFRESH_JWT_EXPIRED'].includes(errorResponse.message)) {
                return logout()
            }

            return reject(errorResponse)
        }
    }
    return new Promise(promisecallback)
}

