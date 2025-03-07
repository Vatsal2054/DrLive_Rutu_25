import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { Link, useNavigate } from "react-router";
import { Logo } from "../UI/Logo";
import { useRef, useState } from "react";
import Container from "../UI/Container";
import toast from "react-hot-toast";

export default function SignupContent() {
    const [designation, setDesignation] = useState("");
    const navigate = useNavigate();

    function handleSubmit() {
        console.log("Sign up form submitted")
        if (designation === "Patient") {
            navigate("/signup/patient");
        } else if (designation === "Doctor") {
            navigate("/signup/doctor");
        } else {
            toast.error("Please select a role to continue");
        }
    }

    return (
        <main className="flex flex-col items-center justify-center h-[100vh]">
            <div className={"p-6 w-[35%]"}>
                <div className="mb-2">
                    <Logo size={50} className="pb-3" />
                    <h1 className="mt-2 text-[2.3rem] font-[300]">What's your role?</h1>
                </div>
                <Input
                    Type={"PRIMARY"}
                    type={"dropdown"}
                    name={"role"}
                    options={["Patient", "Doctor"]}
                    labelText={"Select your designation"}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    extraClasses={"mb-4"}
                />
                <Button type={"MAIN"} onClick={handleSubmit}>
                    Continue
                </Button>
                <div className="pt-5 text-[15px] text-center text-font-grey dark:text-font-darkGrey">
                    Already have an account? <Link to={"/login"} className="text-font-dark dark:text-font-light hover:text-primary dark:hover:text-primary">Login</Link>
                </div>
            </div>
        </main>
    )
}
