import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserWorkoutDays = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return [];
    }

    const workoutDays = await ctx.db
      .query("workoutDays")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Populate exercises for each workout day
    const workoutDaysWithExercises = await Promise.all(
      workoutDays.map(async (day) => {
        const exercises = await Promise.all(
          day.exercises.map(async (exerciseId) => {
            return await ctx.db.get(exerciseId);
          })
        );
        return {
          ...day,
          exerciseDetails: exercises.filter(Boolean),
        };
      })
    );

    return workoutDaysWithExercises;
  },
});

export const createWorkoutDay = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    exerciseIds: v.array(v.id("exercises")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const workoutDayId = await ctx.db.insert("workoutDays", {
      userId: user._id,
      name: args.name,
      description: args.description,
      exercises: args.exerciseIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return workoutDayId;
  },
});

export const updateWorkoutDay = mutation({
  args: {
    workoutDayId: v.id("workoutDays"),
    name: v.string(),
    description: v.optional(v.string()),
    exerciseIds: v.array(v.id("exercises")),
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

    const workoutDay = await ctx.db.get(args.workoutDayId);
    if (!workoutDay || workoutDay.userId !== user._id) {
      throw new Error("Workout day not found or not owned by user");
    }

    await ctx.db.patch(args.workoutDayId, {
      name: args.name,
      description: args.description,
      exercises: args.exerciseIds,
      updatedAt: Date.now(),
    });

    return args.workoutDayId;
  },
});

export const addExerciseToWorkoutDay = mutation({
  args: {
    userId: v.id("users"),
    workoutDayId: v.id("workoutDays"),
    exerciseId: v.id("exercises"),
    weight: v.number(),
    reps: v.number(),
    sets: v.number(),
    weightIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const workoutDay = await ctx.db.get(args.workoutDayId);
    if (!workoutDay || workoutDay.userId !== user._id) {
      throw new Error("Workout day not found or not owned by user");
    }

    // Add exercise to the workout day
    const updatedExercises = [...workoutDay.exercises, args.exerciseId];
    
    await ctx.db.patch(args.workoutDayId, {
      exercises: updatedExercises,
      updatedAt: Date.now(),
    });

    return args.workoutDayId;
  },
});

export const updateExerciseInWorkoutDay = mutation({
  args: {
    userId: v.id("users"),
    workoutDayId: v.id("workoutDays"),
    exerciseId: v.id("exercises"),
    weight: v.number(),
    reps: v.number(),
    sets: v.number(),
    weightIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const workoutDay = await ctx.db.get(args.workoutDayId);
    if (!workoutDay || workoutDay.userId !== user._id) {
      throw new Error("Workout day not found or not owned by user");
    }

    // For now, just update the workout day timestamp
    // In a real app, you'd store exercise settings separately
    await ctx.db.patch(args.workoutDayId, {
      updatedAt: Date.now(),
    });

    return args.workoutDayId;
  },
});

export const deleteWorkoutDay = mutation({
  args: {
    userId: v.id("users"),
    workoutDayId: v.id("workoutDays"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const workoutDay = await ctx.db.get(args.workoutDayId);
    if (!workoutDay || workoutDay.userId !== user._id) {
      throw new Error("Workout day not found or not owned by user");
    }

    await ctx.db.delete(args.workoutDayId);
    return args.workoutDayId;
  },
});
