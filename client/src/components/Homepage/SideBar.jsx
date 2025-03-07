import Button from "../UI/Buttons";
import { useState } from "react";
import { PiList } from "react-icons/pi";
import { motion } from "motion/react";
import { PatientNavContentInfo, DoctorNavContentInfo } from "./SideBarInfo";
import { useNavigate } from "react-router";

export default function SideMenu({ role }) {
    const location = window.location.pathname;
    console.log(location);

    const [selected, setSelected] = useState(location);
    const [expanded, isExpanded] = useState(true);

    const navigate = useNavigate();

    let NavContentInfo;

    if (role === "patient") {
        NavContentInfo = PatientNavContentInfo;
    } else {
        NavContentInfo = DoctorNavContentInfo;
    }

    return (
        <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.2, type: "tween" }}
            className={`h-[100%]  px-4 transition-[width] ${expanded ? "w-[15rem]" : "w-[5.1rem]"}`}>
            <button className="inline-block rounded-xl mb-2 hover:bg-primaryTranslucent transition p-3 " onClick={() => isExpanded(prevValue => !prevValue)}>
                <PiList className="text-[1.6rem]" />
            </button>
            <div className="flex flex-col space-y-2">
                {NavContentInfo.map((item, index) => {
                    return (
                        <Button key={index} type={"NAV"} extraClasses={`flex flex-row text-left ${selected === item.path && "!text-primary font-[600] bg-primaryTranslucent"}`}
                            onClick={() => {
                                setSelected(item.path);
                                navigate(item.path);
                            }}
                        >
                            {
                                selected === item.path ?
                                    <div className="nav-icon mr-4 mb-[-7px] inline-block text-primary">
                                        {item.fillIcon}
                                    </div>
                                    :
                                    <div className="nav-icon mr-4 mb-[-7px] inline-block">
                                        {item.icon}
                                    </div>
                            }
                            <div className={`inline-block transition-opacity ${expanded ? "opacity-1" : "opacity-0"}`}>
                                {item.name}
                            </div>
                        </Button>
                    )
                })}
            </div>
        </motion.div>
    )
}