import { useContext, useState } from "react";
import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { Logo } from "../UI/Logo";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginContent() {
    const [error, setError] = useState({
        field: "",
        message: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const { credentials, setCredentials, loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;

        if (value !== "" && value.includes(" ")) {
            setError({
                field: name,
                message: "Spaces are not allowed!"
            });
            return;
        } else {
            setError({
                field: "",
                message: ""
            });
        }

        setCredentials(prevValue => ({
            ...prevValue,
            [name]: value
        }));
    }

    function checkEmptyFields() {
        for (let key in credentials) {
            if (!credentials[key] || credentials[key].trim() === "") {
                setError({
                    field: key,
                    message: "This field is required!"
                });
                return true;
            }
        }
        return false;
    }

    async function handleSubmit() {
        if (checkEmptyFields()) return;
        console.table(credentials);

        const res = await loginUser();
        if (res) navigate("/");
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <main className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-center mb-6">
                            <Logo size={60} className="text-primary" />
                        </div>

                        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                            Login to your Dr. Live account
                        </p>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div className="relative">
                                <Input
                                    Type={"PRIMARY"}
                                    labelText={"Email"}
                                    type={"email"}
                                    name={"email"}
                                    value={credentials.email}
                                    onChange={handleChange}
                                    errorText={error.field === "email" ? error.message : ""}
                                />
                            </div>

                            <div className="relative">
                                <Input
                                    Type={"PRIMARY"}
                                    labelText={"Password"}
                                    type={showPassword ? "text" : "password"}
                                    name={"password"}
                                    value={credentials.password}
                                    onChange={handleChange}
                                    errorText={error.field === "password" ? error.message : ""}
                                />
                            </div>

                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type={"MAIN"}
                                onClick={handleSubmit}
                                extraClasses="w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 hover:shadow-lg"
                            >
                                Login <ArrowRight className="inline-block w-4 h-4 mt-[-2px]" />
                            </Button>

                            <div className="relative flex items-center gap-3 py-2">
                                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                                <span className="text-sm text-gray-400">or</span>
                                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                            </div>

                            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                                Don't have an account?{" "}
                                <Link
                                    to={"/signup"}
                                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}