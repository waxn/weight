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
            const exercise = await ctx.db.get(exerciseId);
            if (!exercise) return null;
            
            // Get exercise settings
            const settings = await ctx.db
              .query("workoutDayExercises")
              .withIndex("by_workout_day", (q) => q.eq("workoutDayId", day._id))
              .filter((q) => q.eq(q.field("exerciseId"), exerciseId))
              .first();
            
            return {
              ...exercise,
              weight: settings?.weight || 0,
              reps: settings?.reps || 5,
              sets: settings?.sets || 3,
              weightIncrement: settings?.weightIncrement || 5,
            };
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

    // Store exercise settings
    await ctx.db.insert("workoutDayExercises", {
      workoutDayId: args.workoutDayId,
      exerciseId: args.exerciseId,
      weight: args.weight,
      reps: args.reps,
      sets: args.sets,
      weightIncrement: args.weightIncrement,
      createdAt: Date.now(),
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

    // Find the existing exercise settings
    const existingSettings = await ctx.db
      .query("workoutDayExercises")
      .withIndex("by_workout_day", (q) => q.eq("workoutDayId", args.workoutDayId))
      .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
      .first();

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        weight: args.weight,
        reps: args.reps,
        sets: args.sets,
        weightIncrement: args.weightIncrement,
        updatedAt: Date.now(),
      });
    } else {
      // Create new settings if they don't exist
      await ctx.db.insert("workoutDayExercises", {
        workoutDayId: args.workoutDayId,
        exerciseId: args.exerciseId,
        weight: args.weight,
        reps: args.reps,
        sets: args.sets,
        weightIncrement: args.weightIncrement,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Update workout day timestamp
    await ctx.db.patch(args.workoutDayId, {
      updatedAt: Date.now(),
    });

    return args.workoutDayId;
  },
});

export const removeExerciseFromWorkoutDay = mutation({
  args: {
    userId: v.id("users"),
    workoutDayId: v.id("workoutDays"),
    exerciseId: v.id("exercises"),
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

    // Remove exercise from the workout day
    const updatedExercises = workoutDay.exercises.filter((id: string) => id !== args.exerciseId);
    
    await ctx.db.patch(args.workoutDayId, {
      exercises: updatedExercises,
      updatedAt: Date.now(),
    });

    // Remove exercise settings
    const exerciseSettings = await ctx.db
      .query("workoutDayExercises")
      .withIndex("by_workout_day", (q) => q.eq("workoutDayId", args.workoutDayId))
      .filter((q) => q.eq(q.field("exerciseId"), args.exerciseId))
      .first();

    if (exerciseSettings) {
      await ctx.db.delete(exerciseSettings._id);
    }

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
