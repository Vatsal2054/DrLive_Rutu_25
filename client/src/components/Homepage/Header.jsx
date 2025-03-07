import Button from "../UI/Buttons";
import Container from "../UI/Container";
import { Logo } from "../UI/Logo";
import Logout from "../UI/Logout";

export default function Header() {
    return (
        <header className="w-[100vw] ">
            <Container classes={"border-0 rounded-none px-5 py-4 flex justify-between items-center !bg-inherit"}>
                <div className="flex flex-row items-center gap-4">
                    <Logo size={35} />
                    <h1 className="text-[2rem] font-medium stretched">Dr. Live</h1>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Logout />
                </div>
            </Container>
        </header>
    )
}