
import mongoose, { Schema, Document, Types } from "mongoose";

interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action";
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface IWorkflow extends Document {
  workflowname: string;
  description: string;
  userId: Types.ObjectId;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: "draft" | "active" | "inactive";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const nodeSchema = new Schema<WorkflowNode>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["trigger", "condition", "action"],
      required: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const edgeSchema = new Schema<WorkflowEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const workflowSchema = new Schema<IWorkflow>(
  {
    workflowname: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Workflow =
  mongoose.models.Workflow ||
  mongoose.model<IWorkflow>("Workflow", workflowSchema);
