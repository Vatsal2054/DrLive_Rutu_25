import Button from "../UI/Buttons";
import Input from "../UI/Inputs";
import { Link, useNavigate } from "react-router";
import { Logo } from "../UI/Logo";
import { useState } from "react";
import Container from "../UI/Container";
import toast from "react-hot-toast";

export default function SignupContent() {
    const [designation, setDesignation] = useState("");
    const navigate = useNavigate();

    function handleSubmit() {
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
            <Container classes={"p-8 w-[90%] max-w-md"}>
                <div className="mb-6 text-center">
                    <Logo size={50} className="mx-auto pb-3" />
                    <h1 className="mt-2 text-[2.3rem] font-[300]">Welcome to Dr. Live</h1>
                    <p className="text-font-grey dark:text-font-darkGrey mt-3">
                        Let's get started with creating your account
                    </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-medium mb-2">What's your role?</h2>
                    <Input
                        Type={"PRIMARY"}
                        type={"dropdown"}
                        name={"role"}
                        options={["Patient", "Doctor"]}
                        labelText={"Select your role"}
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        extraClasses={"mb-4"}
                    />
                    
                    <div className="text-sm text-font-grey dark:text-font-darkGrey mb-4">
                        <p className="mb-1">Patient: Create an account to book appointments and manage your health records</p>
                        <p>Doctor: Create an account to manage your appointments and patients</p>
                    </div>
                    
                    <Button type={"MAIN"} onClick={handleSubmit} extraClasses="w-full">
                        Continue
                    </Button>
                </div>
                
                <div className="pt-2 text-[15px] text-center text-font-grey dark:text-font-darkGrey">
                    Already have an account? <Link to={"/login"} className="text-font-dark dark:text-font-light hover:text-primary dark:hover:text-primary">Login</Link>
                </div>
            </Container>
        </main>
    )
}