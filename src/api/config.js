import axios from "axios"
import {checkLocal} from "@/uitls"

export default function (config) {
    const instance = axios.create({
        baseURL: 'http://localhost:5000',
        // baseURL: 'http://47.100.242.91',
        timeout: 9999999
    })
    instance.defaults.withCredentials = true
    // 请求拦截
    instance.interceptors.request.use(config => {
        if (checkLocal()) {
            config.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('TOKEN')
        }
        return config
    }, error => {
        /*ignore*/
    })
    instance.interceptors.response.use(res => {
        return res.data ? res.data : res
    }, error => {
        return {status: 1, message: String(error)}
    })
    return instance(config)
}
