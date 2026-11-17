export const validateWorkspaceInvitation = (req, res, next) => {
    const {body} = req;

    if(!body || typeof body !== 'object' || Array.isArray(body)){
        return res.status(400).json({
            success: false,
            message: "Invalid input format JSON object required."
        })
    }

    const allowedFields = ["email", "role"];

    const invalidFields = Object.keys(body).filter((field) => !allowedFields.includes(field));

    if(invalidFields.length > 0){
        return res.status(400).json({
            success: false,
            message: "Invalid fields found.",
            invalidFields,
        })
    }


    const {email, role} = body;


    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const allowedRoles = ["admin", "project_manager", "member"];

    if (role !== undefined && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace role",
      });
    }

    next();
}