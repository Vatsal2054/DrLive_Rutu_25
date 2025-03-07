import { useContext, useState } from "react"
import { PatientInputStructure, PatientStructure } from "../helpers/Data/SignUp_Structures"
import Input from "../components/UI/Inputs";
import { Logo } from "../components/UI/Logo";
import Container from "../components/UI/Container";
import Button from "../components/UI/Buttons";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function PatientSignUp() {
    const [patientInfo, setPatientInfo] = useState(PatientStructure);
    const [error, setError] = useState({
        field: "",
        message: ""
    })

    const { signUpUser } = useContext(AuthContext);

    const navigate = useNavigate();

    function verifyEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function checkEmptyFields() {
        for (let key in patientInfo) {
            if (!patientInfo[key] || patientInfo[key].trim() === "") {
                setError({
                    field: key,
                    message: "This field is required!"
                });
                return true;
            }
        }
        return false;
    }

    async function handleSubmit(){
        console.table(patientInfo);
        if (checkEmptyFields()) return;
        if (!verifyEmail(patientInfo.email)) {
            setError({
                field: "email",
                message: "Invalid email address!"
            });
            return;
        }
        const res = await signUpUser({
            ...patientInfo,
            role: "patient",
            address: {
                street: patientInfo.street,
                city: patientInfo.city,
                state: patientInfo.state,
                zip: patientInfo.zip,
            },
            disabled: patientInfo.disabled === "Yes" ? true : false
        });
        if(res){
            navigate("/login");
        }
    }

    return (
        <>
            <main className="flex justify-center">
                <div className="mb-2 w-[60%]">
                    <div className="py-[4rem]">
                        <Logo size={40} />
                        <h1 className="mt-3 text-3xl font-[400]">Patient Sign Up</h1>
                    </div>
                    <Container classes={"p-6"}>
                        <form onSubmit={e => e.preventDefault()} className="flex justify-between flex-wrap">
                            {PatientInputStructure.map((input, index) => {
                                return (
                                    <Input
                                        Type={"PRIMARY"}
                                        key={index}
                                        type={input.type}
                                        labelText={input.label}
                                        name={input.name}
                                        value={patientInfo[input.name]}
                                        onChange={(e) => setPatientInfo({ ...patientInfo, [input.name]: e.target.value })}
                                        extraClasses={"w-[48%] inline-block mb-4"}
                                        options={input?.options}
                                        errorText={error.field === input.name ? error.message : ""}
                                    />
                                )
                            })}
                            <Button
                                type={"MAIN"}
                                onClick={handleSubmit}
                            >
                                Sign Up
                            </Button>
                        </form>
                    </Container>
                </div>
            </main>
        </>
    );
}