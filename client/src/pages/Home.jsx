import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import HomeLayout from "../components/Homepage/HomeLayout";
import { useNavigate } from "react-router";

export default function Home() {
    const { role, pingUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        pingUserHandler();
    }, []);

    async function pingUserHandler() {
        const res = await pingUser();
        if (!res) {
            console.log("User not authorized");
            navigate("/login");
        }
    }

    if (!role) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <HomeLayout role={role} />
    );
}