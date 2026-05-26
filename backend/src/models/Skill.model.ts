import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: string; // empty string = ungrouped
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkillCategory extends Document {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    icon: { type: String, default: "Wrench" },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    // Empty string means the skill is ungrouped (no category yet)
    category: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SkillCategory = mongoose.model<ISkillCategory>("SkillCategory", SkillCategorySchema);
export const Skill = mongoose.model<ISkill>("Skill", SkillSchema);
