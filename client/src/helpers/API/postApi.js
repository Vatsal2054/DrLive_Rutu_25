import axios from "axios";
import apiInfo from "./apiInfo";
import toast from "react-hot-toast";

export default async function postApi(path, body) {
    axios.defaults.withCredentials = true;
    let response;

    await axios.post(apiInfo.URL + path, {
        ...body,
        withCredentials: true,
    })
        .then(Response => {
            response = Response;
        })
        .catch(err => {
            console.error(err);
            toast.error(err.response.data.message);
            response = err;
        })

    return response;
}

