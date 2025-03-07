import { createContext } from "react";

export const AuthContext = createContext({
    credentials: {
        identifier: '',
        password: ''
    },
    signUpCredentials: {
        username: '',
        email: '',
        password: '',
    },
    setCredentials: () => {},
    setSignUpCredentials: () => {},
    loginUser: () => {},
    signUpUser: () => {},
    googleLogin: () => {},
    pingUser: () => {}
})