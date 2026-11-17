
import mongoose from "mongoose";

const workspaceInvitationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "project_manager", "member"],
      default: "member",
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired", "delivery_failed"],
      default: "pending",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

workspaceInvitationSchema.index(
  { workspace: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  }
);

const WorkspaceInvitation = mongoose.model(
  "WorkspaceInvitation",
  workspaceInvitationSchema
);

export default WorkspaceInvitation;
