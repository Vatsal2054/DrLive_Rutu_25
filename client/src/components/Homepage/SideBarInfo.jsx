import { PiChats, PiScanDuotone , PiClipboardText, PiClipboardTextDuotone, PiGearSix, PiGearSixDuotone, PiHouse, PiHouseDuotone, PiMagnifyingGlass, PiMagnifyingGlassDuotone, PiUserCircle, PiUserCircleDuotone, PiScan, PiPill, PiPillDuotone, PiClockUser, PiClockUserDuotone } from "react-icons/pi";

export const PatientNavContentInfo = [
    {
        name: "Home",
        path: "/",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: <PiClipboardText />,
        fillIcon: <PiClipboardTextDuotone />
    },
    {
        name: "Find Doctor",
        path: "/find-doctor",
        icon: <PiMagnifyingGlass />,
        fillIcon: <PiMagnifyingGlassDuotone  />
    },
    {
        name: "Analyze Report",
        path: "/report",
        icon: <PiScan  />,
        fillIcon: <PiScanDuotone   />
    },
    {
        name: "Prescriptions",
        path: "/prescriptions",
        icon: <PiPill />,
        fillIcon: <PiPillDuotone />
    },
    {
        name: "Profile",
        path: "/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]

export const DoctorNavContentInfo = [
    {
        name: "Home",
        path: "/",
        icon: <PiHouse />,
        fillIcon: <PiHouseDuotone />
    },
    {
        name: "Appointments",
        path: "/appointments",
        icon: <PiClockUser />,
        fillIcon: <PiClockUserDuotone />
    },
    {
        name: "Profile",
        path: "/profile",
        icon: <PiUserCircle />,
        fillIcon: <PiUserCircleDuotone />
    }
]

