// import { useState } from 'react';
// import { MdError } from 'react-icons/md';
// import { PiEye, PiEyeClosed } from 'react-icons/pi';

// export default function Input({ Type, labelText, errorText, type, extraClasses, ...props }) {
//     const [isVisible, setIsVisible] = useState(false);

//     let inputClasses = "", labelClasses = "";
//     if (Type == "PRIMARY") inputClasses = "input-primary";
//     if (Type == "SECONDARY") inputClasses = "input-secondary";

//     if (props.value?.trim() !== "") labelClasses = " !top-[0rem] !left-[0px]";

//     if (type == "password") {
//         inputClasses += " password-input";
//         return (
//             <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
//                 <div className='absolute top-[1.95rem] right-3 p-1 text-[1.2rem] rounded-2xl cursor-pointer' onClick={() => setIsVisible(prev => !prev)}>
//                     {
//                         isVisible ? <PiEye /> : <PiEyeClosed />
//                     }
//                 </div>
//                 <input
//                     {...props}
//                     type={isVisible ? "text" : "password"}
//                     className={"peer z-10 cursor-text bg-transparent " + inputClasses}
//                 />
//                 {
//                     labelText &&
//                     <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
//                         {labelText}
//                     </label>
//                 }
//                 {
//                     errorText &&
//                     <p className="absolute top-[4.5rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600 dark:text-red-400">
//                         <MdError className="inline-block mr-[2px] mb-[2px]" />{errorText}
//                     </p>
//                 }
//             </div>
//         )
//     }

//     return (
//         <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
//             <input
//                 {...props}
//                 className={"peer z-10 cursor-text bg-transparent " + inputClasses}
//             />
//             {
//                 labelText &&
//                 <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
//                     {labelText}
//                 </label>
//             }
//             {
//                 errorText &&
//                 <p className="absolute top-[4.5rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600">
//                     <MdError className="inline-block mr-[2px] mb-[2px]" />{errorText}
//                 </p>
//             }
//         </div>
//     )
// }

import { useState } from "react";
import { MdError } from "react-icons/md";
import { PiEye, PiEyeClosed } from "react-icons/pi";

export default function Input({ Type, labelText, errorText, type, options = [], extraClasses, ...props }) {
    const [isVisible, setIsVisible] = useState(false);

    let inputClasses = "", labelClasses = "";
    if (Type === "PRIMARY") inputClasses = "input-primary";
    if (Type === "SECONDARY") inputClasses = "input-secondary";

    if (props.value?.trim() !== "") labelClasses = " !top-[0rem] !left-[0px]";

    // Password Input
    if (type === "password") {
        inputClasses += " password-input";
        return (
            <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
                <div
                    className="absolute top-[1.95rem] right-3 p-1 text-[1.2rem] rounded-2xl cursor-pointer"
                    onClick={() => setIsVisible((prev) => !prev)}
                >
                    {isVisible ? <PiEye /> : <PiEyeClosed />}
                </div>
                <input
                    {...props}
                    type={isVisible ? "text" : "password"}
                    className={"peer z-10 cursor-text bg-transparent " + inputClasses}
                />
                {labelText && (
                    <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <p className="absolute top-[4.2rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600 dark:text-red-400">
                        <MdError className="inline-block mr-[2px] mb-[2px]" />
                        {errorText}
                    </p>
                )}
            </div>
        );
    }

    // Select Dropdown
    if (type === "dropdown") {
        return (
            <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
                <select
                    {...props}
                    className={"peer z-10 cursor-pointer bg-transparent appearance-none !py-[10px] " + inputClasses}
                >
                    <option defaultChecked hidden></option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {labelText && (
                    <label className={"absolute top-[2.05rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <p className="absolute top-[4.2rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600 dark:text-red-400">
                        <MdError className="inline-block mr-[2px] mb-[2px]" />
                        {errorText}
                    </p>
                )}
            </div>
        );
    }

    if(type === "time"){
        return (
            <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
                <input {...props} type={type} className={"peer z-10 cursor-text bg-transparent !py-[8px] " + inputClasses} />
                {labelText && (
                    <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                        {labelText}
                    </label>
                )}
                {errorText && (
                    <p className="absolute top-[4.2rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600">
                        <MdError className="inline-block mr-[2px] mb-[2px]" />
                        {errorText}
                    </p>
                )}
            </div>
        );
    }

    // Default Input
    return (
        <div className={`py-2 relative ${labelText && "pt-6"} ` + extraClasses}>
            <input {...props} type={type} className={"peer z-10 cursor-text bg-transparent " + inputClasses} />
            {labelText && (
                <label className={"absolute top-[2.15rem] left-4 pointer-events-none text-sm peer-focus:top-0 peer-focus:left-0 font-medium text-font-dark dark:text-font-light transition-all ease-in-out duration-300 z-[0]" + labelClasses}>
                    {labelText}
                </label>
            )}
            {errorText && (
                <p className="absolute top-[4.2rem] left-[0rem] z-20 bg-background-redTranslucent backdrop-blur-md rounded-xl px-4 py-2 w-full text-sm text-red-600">
                    <MdError className="inline-block mr-[2px] mb-[2px]" />
                    {errorText}
                </p>
            )}
        </div>
    );
}
