import LoginContent from "../components/login/LoginContent";
import AuthContextProvider from "../context/AuthContextProvider";

export default function Login(){
    return (
        <AuthContextProvider>
            <LoginContent />
        </AuthContextProvider>
    )
}