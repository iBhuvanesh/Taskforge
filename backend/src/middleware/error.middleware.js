const errorMiddleware = (err, req, res, next) => {
    console.log(err);

    if(err.code === 11000){
        return res.status(409).json({
            success: false,
            message: "Email already exists",
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal server error" : err.message,
    });
};

export default errorMiddleware;