export const validateCreateProject = (req, res, next) => {
    const {body} = req;

    if(!body || typeof body !== "object" || Array.isArray(body)){
        return res.status(400).json({
            success: false,
            message: "Request body must be valid JSON object",
        });
    }

    const allowedFields = ["name", "description"];

    const invalidFields = Object.keys(body).filter((field) => !allowedFields.includes(field));

    if(invalidFields.length > 0){
        return res.status(400).json({
            success: false,
            message: "Request contains unsupported fields.",
            invalidFields,
        });
    }


    const errors = [];

    const {name, description} = body;

    if(typeof name !== "string" || name.trim().length === 0){
        errors.push("Project name is required.")
    }else if(name.trim().length() < 3 || name.trim().length() > 100){
        errors.push("Project name must be a valid string with minimum 3 and maximum 100 characters");
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        errors.push("Project description must be a string.");
      } else if (body.description.trim().length > 1000) {
        errors.push("Project description cannot exceed 1000 characters.");
      }
    }


    if(errors.length > 0){
        return res.status(400).json({
            success: false,
            message: "Project validation failed.",
            invalidFields: errors,
        });
    }


    next();
}