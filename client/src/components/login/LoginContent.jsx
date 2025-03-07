import { useContext, useState } from "react";
import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { Logo } from "../UI/Logo";

export default function LoginContent() {
    const [error, setError] = useState({
        field: "",
        message: ""
    });

    const { credentials, setCredentials, loginUser } = useContext(AuthContext);

    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;

        if (value !== "" && value.includes(" ")) {
            setError({
                field: name,
                message: "Spaces are not allowed!"
            })
            return;
        } else {
            setError({
                field: "",
                message: ""
            })
        }

        setCredentials(prevValue => {
            return {
                ...prevValue,
                [name]: value
            }
        })
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


    return (
        <main>
            <div className="w-[100vw] h-[100vh] p-8 flex flex-row">
                <section className="flex-[4] flex justify-center items-center">
                    <div className="w-[30%] flex flex-col">
                        <Logo size={50} className="pb-3" />
                        <h1 className="text-[2.6rem] mb-4 font-medium stretched flex justify-between items-center">
                            <span>
                                <span className="font-light">Login to </span>
                                Dr. Live
                            </span>
                        </h1>
                        <form onSubmit={(e) => e.preventDefault()} className="">
                            <Input
                                Type={"PRIMARY"}
                                labelText={"Email"}
                                type={"email"}
                                name={"email"}
                                value={credentials.email}
                                onChange={handleChange}
                                errorText={error.field === "email" ? error.message : ""}
                            // extraClasses={"mb-2"}
                            />
                            <Input
                                Type={"PRIMARY"}
                                labelText={"Password"}
                                type={"password"}
                                name={"password"}
                                value={credentials.password}
                                onChange={handleChange}
                                errorText={error.field === "password" ? error.message : ""}
                                extraClasses={"mb-2"}
                            />
                            <div className="w-full mb-4 flex items-center">
                                <a href="#" className="text-sm pr-2 text-font-grey dark:text-font-darkGrey hover:text-primary dark:hover:text-primary">Forgot password?</a>
                                {/* <div className="flex-1 h-[1px] bg-background-greyDark"></div> */}
                            </div>
                            <Button
                                type={"MAIN"}
                                onClick={handleSubmit}
                                // disabled={!credentials.email || !credentials.password}
                                extraClasses={"mb-4"}
                            >
                                Login
                            </Button>
                            {/* <div className="w-full mb-4 flex items-center">
                                <div className="text-sm pr-2 dark:text-font-darkGrey text-font-grey">Or continue with</div>
                                <div className="flex-1 h-[1px] dark:bg-font-darkGrey bg-font-grey"></div>
                            </div>
                            <Button
                                type={"TERTIARY"}
                                onClick={handleGoogleLogin}
                                extraClasses={"mb-4"}
                            >
                                <FcGoogle className="inline-block text-xl mb-[2px]" /> Sign in using Google
                            </Button> */}
                            <div className="pt-2 text-[15px] text-center text-font-grey dark:text-font-darkGrey">
                                Don&apos;t have an account? <Link to={"/signup"} className="text-font-dark dark:text-font-light hover:text-primary dark:hover:text-primary">Sign up</Link>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    )
}