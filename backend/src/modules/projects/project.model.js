import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace reference is required"],
    },

    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    // Normalized name used for case-insensitive uniqueness.
    nameKey: {
      type: String,
      required: true,
      select: false,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active/completed project names
// within the same workspace.
projectSchema.index(
  { workspace: 1, nameKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["active", "completed"] },
    },
    name: "unique_non_archived_project_name_per_workspace",
  }
);

// Optimize workspace project listing.
projectSchema.index({
  workspace: 1,
  status: 1,
  createdAt: -1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;