import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBuiltInExercises = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db
      .query("exercises")
      .filter((q) => q.eq(q.field("isBuiltIn"), true))
      .collect();

    return exercises;
  },
});

export const getUserExercises = query({
  args: {},
  handler: async (ctx) => {
    // For development, return mock data
    // In production, implement proper authentication and database queries
    return [
      { _id: "mock-user-exercise-1", name: "Custom Exercise", icon: "💪", category: "strength", isBuiltIn: false }
    ];
  },
});

export const getAllExercises = query({
  args: {},
  handler: async (ctx) => {
    const builtInExercises = await ctx.db
      .query("exercises")
      .filter((q) => q.eq(q.field("isBuiltIn"), true))
      .collect();

    return builtInExercises;
  },
});

export const createExercise = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // For development, always use demo user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const exerciseId = await ctx.db.insert("exercises", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      category: args.category,
      isBuiltIn: false,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return exerciseId;
  },
});

export const updateExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // For development, just return success
    // In production, implement proper authentication and database updates
    console.log('Updating exercise:', args);
    return args.exerciseId;
  },
});

export const deleteExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    // For development, just return success
    // In production, implement proper authentication and database deletion
    console.log('Deleting exercise:', args);
    return args.exerciseId;
  },
});

// Initialize built-in exercises
export const initializeBuiltInExercises = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if built-in exercises already exist
    const existingExercises = await ctx.db
      .query("exercises")
      .filter((q) => q.eq(q.field("isBuiltIn"), true))
      .collect();

    if (existingExercises.length > 0) {
      return true; // Already initialized
    }

    // Create built-in exercises
    const builtInExercises = [
      { name: "Bench Press", icon: "bench-press", category: "strength" },
      { name: "Squat", icon: "squat", category: "strength" },
      { name: "Deadlift", icon: "deadlift", category: "strength" },
      { name: "Overhead Press", icon: "overhead-press", category: "strength" },
      { name: "Pull-ups", icon: "pull-ups", category: "strength" },
      { name: "Push-ups", icon: "push-ups", category: "strength" },
      { name: "Dips", icon: "dips", category: "strength" },
      { name: "Rows", icon: "rows", category: "strength" },
      { name: "Lunges", icon: "lunges", category: "strength" },
      { name: "Plank", icon: "plank", category: "core" },
      { name: "Crunches", icon: "crunches", category: "core" },
      { name: "Running", icon: "running", category: "cardio" },
      { name: "Cycling", icon: "cycling", category: "cardio" },
      { name: "Swimming", icon: "swimming", category: "cardio" },
      { name: "Yoga", icon: "yoga", category: "flexibility" }
    ];

    for (const exercise of builtInExercises) {
      await ctx.db.insert("exercises", {
        name: exercise.name,
        icon: exercise.icon,
        category: exercise.category,
        isBuiltIn: true,
        createdAt: Date.now(),
      });
    }

    return true;
  },
});
