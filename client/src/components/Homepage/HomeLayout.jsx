import { Outlet } from "react-router";
import SideMenu from "./SideBar";
import Header from "./Header";
import Container from "../UI/Container";
import MedicalChatModal from "../../pages/ChatBot";

export default function HomeLayout({ role }) {
    return (
        <main className="h-[100vh] flex flex-col bg-background-greyLight dark:bg-background-dark overflow-hidden">
            <Header />
            <main className="h-full flex flex-row flex-1">
                <SideMenu role={role} />
                <div className="flex-1 flex pr-8 pb-[6rem] overflow-hidden">
                    <Container classes="flex-1 h-full overflow-auto">
                        <Outlet />
                    </Container>
                    <MedicalChatModal />
                </div>
            </main>
        </main>

    )
}