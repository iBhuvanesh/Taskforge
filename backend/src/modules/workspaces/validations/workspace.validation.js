export const validateWorkspace = (req, res, next) => {
    const {body} = req;

    if(!body || typeof body != 'object' || Array.isArray(body)){
        return res.status(400).json({
            success: false,
            message: "Invalid request body JSON object are required"
        });
    }

    const { name, description } = body;

    const allowedFields = ['name', 'description'];

    const invalidFields = Object.keys(body).filter(field => !allowedFields.includes(field));

    if(invalidFields.length > 0){
        return res.status(400).json({
            success: false,
            message: "Invalid fields in request body",
            invalidFields,
        })
    }

    if(!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100){
        return res.status(400).json({
            success: false,
            message: "Invalid workspace name. It must be a string with at least 3 characters and at most 100 characters."
        })
    }

    if(description !== undefined && (typeof description !== 'string' || description.trim().length > 500)){
        return res.status(400).json({
            success: false,
            message: "Invalid workspace description. It must be a string with at most 500 characters."
        })
    }

    next();
}