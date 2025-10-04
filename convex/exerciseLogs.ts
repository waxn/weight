import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExerciseLogs = query({
  args: {
    exerciseId: v.optional(v.id("exercises")),
    workoutDayId: v.optional(v.id("workoutDays")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For development, always use demo user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

    if (!user) {
      return [];
    }

    // For development, return empty array
    // In production, implement proper database queries
    return [];
  },
});

export const logExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
    workoutDayId: v.id("workoutDays"),
    weight: v.number(),
    reps: v.number(),
    sets: v.number(),
    notes: v.optional(v.string()),
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

    const logId = await ctx.db.insert("exerciseLogs", {
      userId: user._id,
      exerciseId: args.exerciseId,
      workoutDayId: args.workoutDayId,
      weight: args.weight,
      reps: args.reps,
      sets: args.sets,
      notes: args.notes,
      completedAt: Date.now(),
    });

    return logId;
  },
});

export const getLastExerciseWeight = query({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    // For development, always use demo user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

    if (!user) {
      return null;
    }

    const lastLog = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_exercise", (q) => q.eq("exerciseId", args.exerciseId))
      .order("desc")
      .first();

    return lastLog?.weight || null;
  },
});

export const getSuggestedWeight = query({
  args: {
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    // For development, always use demo user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

    if (!user) {
      return null;
    }

    const lastLog = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_exercise", (q) => q.eq("exerciseId", args.exerciseId))
      .order("desc")
      .first();

    if (!lastLog) {
      return null;
    }

    // Suggest weight based on user's weight increment setting
    const suggestedWeight = lastLog.weight + (user.weightIncrement || 5);
    return suggestedWeight;
  },
});
