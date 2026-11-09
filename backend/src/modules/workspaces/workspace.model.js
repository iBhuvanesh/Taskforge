import mongoose from "mongoose";


const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "workspace name is required"],
        trim: true,
        minlength: [3, "workspace name must be at least 3 characters long"],
        maxlength: 100,
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, "workspace description must be at most 500 characters long"],
        default: "",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},{ timestamps: true,});


const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;