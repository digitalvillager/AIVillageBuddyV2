import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  timeline: "quick" | "medium" | "strategic";
  budget: "under_5k" | "5k_to_15k" | "15k_to_50k" | "over_50k";
  primaryGoal: "reduce_costs" | "increase_revenue" | "improve_efficiency" | "enhance_customer_experience" | "solve_specific_problem";
  technicalComplexity: number;
  projectConfidence: boolean;
  additionalContext?: string;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },
    timeline: {
      type: String,
      enum: ["quick", "medium", "strategic"],
      default: "medium",
    },
    budget: {
      type: String,
      enum: ["under_5k", "5k_to_15k", "15k_to_50k", "over_50k"],
      default: "5k_to_15k",
    },
    primaryGoal: {
      type: String,
      enum: [
        "reduce_costs",
        "increase_revenue",
        "improve_efficiency",
        "enhance_customer_experience",
        "solve_specific_problem",
      ],
      default: "improve_efficiency",
    },
    technicalComplexity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    projectConfidence: {
      type: Boolean,
      default: false,
    },
    additionalContext: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", projectSchema); 