import toast from "react-hot-toast";
import apiInfo from "./apiInfo";
import axios from "axios";


async function getApi(path, parameters) {
    axios.defaults.withCredentials = true;
    let response;
    await axios.get(apiInfo.URL + path, {
        ...parameters,
        withCredentials: true,
    })
        .then(Response => {
            response = Response;
        })
        .catch(err => {
            console.log(err);
            toast.error(err.response.data.message);
            response = err;
        })
    return response;
}

export default getApi;