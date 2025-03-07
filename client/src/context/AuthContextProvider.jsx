import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
import { UserContext } from "./UserContext";

export default function AuthContextProvider({children}) {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    })

    const { setUserInfo } = useContext(UserContext);
    
    async function handleLoginUser() {
        console.log("Logging in User...")
        const res = await postApi("/auth/login", {
            email: credentials.email,
            password: credentials.password
        });
        console.log(res);
        if(res.status === 200){
            toast.success("User Logged in Successfully");
            return true;
        }
        return false;
    }
    
    async function handleSignUp(signUpCredentials) {
        console.log("Signing Up User...")
        const res = await postApi("/auth/register", signUpCredentials);
        console.log(res);
        if(res.status === 200){
            toast.success("User Signed Up Successfully");
            return true;
        }
        return false;
    }

    async function handleGoogleLogin(){
        window.location.href = 'http://localhost:3000/auth/google';
    }

    async function handlePingUser(){
        console.log("Pinging User...")
        const res = await getApi("/auth/");
        console.log(res);
        if(res.status === 200){
            console.log("Authorized User");
            setUserInfo(res.data.data);
            return true;
        }
        return false;
    }

    //Values to be passed to the context
    const ctxValue = {
        credentials: credentials,
        setCredentials: setCredentials,
        loginUser: handleLoginUser,
        signUpUser: handleSignUp,
        googleLogin: handleGoogleLogin,
        pingUser: handlePingUser,
    }

    return (
        <AuthContext.Provider value={ctxValue} >
            { children }
        </AuthContext.Provider>
    )
}