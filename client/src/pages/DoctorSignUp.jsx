import { useContext, useState } from "react"
import { DoctorInputSections, DoctorStructure } from "../helpers/Data/SignUp_Structures"
import Input from "../components/UI/Inputs";
import { Logo } from "../components/UI/Logo";
import Container from "../components/UI/Container";
import Button from "../components/UI/Buttons";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function DoctorSignUp() {
    const [doctorInfo, setDoctorInfo] = useState(DoctorStructure);
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
        for (let key in doctorInfo) {
            if (!doctorInfo[key] || doctorInfo[key].trim() === "") {
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
        if (checkEmptyFields()) return;
        if (!verifyEmail(doctorInfo.email)) {
            setError({
                field: "email",
                message: "Invalid email address!"
            });
            return;
        }
        
        const res = await signUpUser({
            ...doctorInfo,
            role: "doctor",
            address: {
                street: doctorInfo.street,
                city: doctorInfo.city,
                state: doctorInfo.state,
                zip: doctorInfo.zip,
            },
        });
        
        if(res){
            navigate("/login");
        }
    }

    return (
        <>
            <main className="flex justify-center">
                <div className="mb-2 w-[70%] max-w-4xl">
                    <div className="py-[3rem]">
                        <Logo size={40} />
                        <h1 className="mt-3 text-3xl font-[400]">Doctor Sign Up</h1>
                        <p className="text-font-grey dark:text-font-darkGrey mt-2">Please fill out the form below to create your doctor account</p>
                    </div>
                    <Container classes={"p-6"}>
                        <form onSubmit={e => e.preventDefault()} className="flex flex-col">
                            {DoctorInputSections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="mb-6">
                                    <h2 className="text-xl font-[700] mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">{section.title}</h2>
                                    <div className="flex flex-wrap justify-between">
                                        {section.fields.map((input, index) => (
                                            <Input
                                                Type={"PRIMARY"}
                                                key={index}
                                                type={input.type}
                                                labelText={input.label}
                                                name={input.name}
                                                value={doctorInfo[input.name]}
                                                onChange={(e) => setDoctorInfo({ ...doctorInfo, [input.name]: e.target.value })}
                                                extraClasses={"w-[48%] inline-block mb-4"}
                                                options={input?.options}
                                                errorText={error.field === input.name ? error.message : ""}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center mt-4">
                                <Button
                                    type={"MAIN"}
                                    onClick={handleSubmit}
                                    extraClasses="px-10"
                                >
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </Container>
                </div>
            </main>
        </>
    );
}