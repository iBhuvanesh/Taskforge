
export const validateUpdateWorkspace = async (req, res, next) => {
    const {body} = req;

    if(!body || typeof body !== "object" || Array.isArray(body)){
        return res.status(400).json({
            success: false,
            message: "Invalid request body json object required.",
        });
    }


    const allowedFields = ["name","description"];

    const invalidFields = Object.keys(body).filter(value => !allowedFields.includes(value));

    if(invalidFields.length > 0){
        res.status(400).json({
            success: false,
            message: "Invalid fields found",
            invalidFields,
        })
    }

    if(Object.keys(body).length === 0){
        res.status(400).json({
            success: false,
            message: "Atleast one field is required",
        })
    }

    const {name, description} = body;

    if(name !== undefined && (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) ){
        return res.status(400).json({
            success: false,
            message: "name must be a valid string with atleast 3 and at most 99 characters length",
        });
    }


    if(description !== undefined && (typeof description !== 'string' || description.trim().length > 500)){
        return res.status(400).json({
            success: false,
            message: "description must be string with at most 500 characters length.",
        });
    }

    next();
}