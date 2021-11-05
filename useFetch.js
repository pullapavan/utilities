import { useState } from "react";
import { get, post } from '../services/httpUtiliy'

export default () => {
    const [data, setData] = useState({
        response: null,
        error: false,
        loading: true,
    });

    const getApi = (url, query = {}, options) => {
        setData({ ...data, error: null, loading: true });
        get(url, query, options).then((reponse) => {
            setData({
                reponse,
                error: false,
                loading: false,
            });
        }).catch(error => {
            setData({
                response: error && error.response,
                error: true,
                loading: false,
            });
        })
    }

    const postApi = (url, payload, options) => {
        setData({ ...data, error: null, loading: true });
        post(url, payload, options).then((reponse) => {
            setData({
                reponse,
                error: false,
                loading: false,
            });
        }).catch(error => {
            setData({
                response: error && error.response,
                error: true,
                loading: false,
            });
        })
    }
    return { getApi, postApi, ...data };
};

