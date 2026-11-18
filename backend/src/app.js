import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import workspaceRouter from "./modules/workspaces/workspace.routes.js";
import projectRouter from "./modules/projects/project.routes.js";

const app = express();


app.use(express.json());

// health check route
app.get("/api/v1/health", (req,res) => {
    res.status(200).json({
        status: "success", 
        message: "Server is running!"
    })
})


// Authentication routes
app.use("/api/v1/auth", authRouter);


// workspace routes
app.use("/api/v1/workspaces", workspaceRouter);


app.use("/api/v1", projectRouter);


app.use(errorMiddleware);

export default app;