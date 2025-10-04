import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    weight: v.optional(v.number()),
    weightIncrement: v.optional(v.number()), // How much weight to add each session
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  workoutDays: defineTable({
    userId: v.id("users"),
    name: v.string(), // e.g., "Leg Day", "Push Day"
    description: v.optional(v.string()),
    exercises: v.array(v.id("exercises")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  exercises: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()), // Icon name or emoji
    category: v.string(), // e.g., "strength", "cardio", "flexibility"
    isBuiltIn: v.boolean(), // Whether it's a built-in exercise or user-created
    createdBy: v.optional(v.id("users")), // null for built-in exercises
    createdAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_creator", ["createdBy"]),

  exerciseLogs: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    workoutDayId: v.id("workoutDays"),
    weight: v.number(),
    reps: v.number(),
    sets: v.number(),
    notes: v.optional(v.string()),
    completedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_exercise", ["exerciseId"])
    .index("by_workout_day", ["workoutDayId"])
    .index("by_date", ["completedAt"]),
});
