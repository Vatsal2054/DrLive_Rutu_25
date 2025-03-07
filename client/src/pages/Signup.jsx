import AuthContextProvider from "../context/AuthContextProvider";
import SignUpContent from "../components/register/SignUpContent";

export default function SignUp(){
    return (
        <AuthContextProvider>
            <SignUpContent />
        </AuthContextProvider>
    )
}