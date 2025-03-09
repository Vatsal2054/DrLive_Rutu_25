export const PatientStructure = {
    // Personal Information
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "dob": "",
    "gender": "",
    
    // Authentication
    "password": "",
    "confirmPassword": "",
    
    // Address Information
    "street": "",
    "city": "",
    "state": "",
    "zip": "",
    
    // Medical Information
    "bloodGroup": "",
    "height": "",
    "weight": "",
    "allergies": "",
    "disabled": "",
}

export const DoctorStructure = {
    // Personal Information
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "gender": "",
    
    // Authentication
    "password": "",
    "confirmPassword": "",
    
    // Address Information
    "street": "",
    "city": "",
    "state": "",
    "zip": "",
    
    // Professional Information
    "specialization": "",
    "experience": "",
    "degree": "",
    "workingPlace": "",
}

export const PatientInputSections = [
    {
        title: "Personal Information",
        fields: [
            { name: "firstName", type: "text", label: "First Name" },
            { name: "lastName", type: "text", label: "Last Name" },
            { name: "email", type: "email", label: "Email" },
            { name: "phone", type: "tel", label: "Phone Number" },
            { name: "dob", type: "date", label: "Date of Birth" },
            {
                name: "gender",
                type: "dropdown",
                label: "Gender",
                options: ["Male", "Female", "Other"],
            },
        ]
    },
    {
        title: "Authentication",
        fields: [
            { name: "password", type: "password", label: "Password" },
            { name: "confirmPassword", type: "password", label: "Confirm Password" },
        ]
    },
    {
        title: "Address Information",
        fields: [
            { name: "street", type: "text", label: "Street/Area" },
            { name: "city", type: "text", label: "City" },
            { name: "state", type: "text", label: "State" },
            { name: "zip", type: "text", label: "Zip Code" },
        ]
    },
    {
        title: "Medical Information",
        fields: [
            {
                name: "bloodGroup",
                type: "dropdown",
                label: "Blood Group",
                options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            },
            { name: "height", type: "number", label: "Height (cm)" },
            { name: "weight", type: "number", label: "Weight (kg)" },
            { name: "allergies", type: "text", label: "Allergies" },
            { name: "disabled", type: "dropdown", label: "Disabled", options: ["Yes", "No"] },
        ]
    }
];

export const DoctorInputSections = [
    {
        title: "Personal Information",
        fields: [
            { name: "firstName", type: "text", label: "First Name" },
            { name: "lastName", type: "text", label: "Last Name" },
            { name: "email", type: "email", label: "Email" },
            { name: "phone", type: "tel", label: "Phone Number" },
            {
                name: "gender",
                type: "dropdown",
                label: "Gender",
                options: ["Male", "Female", "Other"],
            },
        ]
    },
    {
        title: "Authentication",
        fields: [
            { name: "password", type: "password", label: "Password" },
            { name: "confirmPassword", type: "password", label: "Confirm Password" },
        ]
    },
    {
        title: "Address Information",
        fields: [
            { name: "street", type: "text", label: "Street/Area" },
            { name: "city", type: "text", label: "City" },
            { name: "state", type: "text", label: "State" },
            { name: "zip", type: "text", label: "Zip Code" },
        ]
    },
    {
        title: "Professional Information",
        fields: [
            {
                name: "specialization",
                type: "dropdown",
                label: "Specialization",
                options: ["Cardiologist", "Dermatologist", "Pediatrician", "Neurologist", "Orthopaedic", "Psychiatrist"],
            },
            { name: "experience", type: "number", label: "Years of Experience" },
            { name: "degree", type: "text", label: "Degree" },
            { name: "workingPlace", type: "text", label: "Current Workplace" },
        ]
    }
];

// For backward compatibility
export const PatientInputStructure = PatientInputSections.flatMap(section => section.fields);
export const DoctorInputStructure = DoctorInputSections.flatMap(section => section.fields);