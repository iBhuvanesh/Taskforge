export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    const errors = [];

    if(typeof name !== "string" || !name.trim()){
        errors.push("Name is required and must be a non-empty string.");
    }

    if(typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){
        errors.push("A valid email is required");
    }

    if( typeof password !== "string" || password.length < 8){
        errors.push("Password must contain at least 8 characters");
    }

    if(errors.length > 0){
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
}