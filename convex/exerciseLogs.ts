import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExerciseLogs = query({
  args: {
    userId: v.id("users"),
    exerciseId: v.optional(v.id("exercises")),
    workoutDayId: v.optional(v.id("workoutDays")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return [];
    }

    let query = ctx.db
      .query("exerciseLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.exerciseId) {
      query = query.filter((q) => q.eq(q.field("exerciseId"), args.exerciseId));
    }

    if (args.workoutDayId) {
      query = query.filter((q) => q.eq(q.field("workoutDayId"), args.workoutDayId));
    }

    const logs = await query
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

export const logExercise = mutation({
  args: {
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    workoutDayId: v.id("workoutDays"),
    weight: v.number(),
    reps: v.number(),
    sets: v.number(),
    weightIncrement: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const logId = await ctx.db.insert("exerciseLogs", {
      userId: args.userId,
      exerciseId: args.exerciseId,
      workoutDayId: args.workoutDayId,
      weight: args.weight,
      reps: args.reps,
      sets: args.sets,
      weightIncrement: args.weightIncrement,
      notes: args.notes,
      completedAt: Date.now(),
    });

    return logId;
  },
});

export const getLastExerciseWeight = query({
  args: {
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const lastLog = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
      .order("desc")
      .first();

    return lastLog?.weight || null;
  },
});

export const getSuggestedWeight = query({
  args: {
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const lastLog = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
      .order("desc")
      .first();

    if (!lastLog) {
      return null;
    }

    // Suggest weight based on the last log's weight increment
    const suggestedWeight = lastLog.weight + lastLog.weightIncrement;
    return suggestedWeight;
  },
});
