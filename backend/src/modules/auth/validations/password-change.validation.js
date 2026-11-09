export const validatePasswordChange = (req, res, next) => {
    const {currentPassword, newPassword} = req.body ?? {};

    const allowedFields = ["currentPassword", "newPassword"];

    const invalidFields = Object.keys(req.body ?? {}).filter((fields) => !allowedFields.includes(fields));

    if(invalidFields.length > 0){
         return res.status(400).json(
            {success:false,
            message: "Invalid fields provided",
            invalidFields,
            }
        );
    }

    if( typeof currentPassword !== "string" || !currentPassword){
        return res.status(400).json(
            {success:false,
            message: "Current password is required"
            }
        );
    }

    if( typeof newPassword !== "string" || newPassword.length < 8){
        return res.status(400).json(
            {success:false,
            message: "New password must be at least 8 characters long"
            }
        );
    }

    if(currentPassword === newPassword){
        return res.status(400).json(
            {success:false,
            message: "New password must be different from the current password"
            }
        );
    }

    next();


}