import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // For now, return null - no automatic user creation
    // In production, implement proper authentication with Convex Auth
    return null;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    weight: v.optional(v.number()),
    weightIncrement: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      weight: args.weight,
      weightIncrement: args.weightIncrement || 5, // Default 5lb increment
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const updateUserWeight = mutation({
  args: {
    weight: v.number(),
    weightIncrement: v.optional(v.number()),
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

    await ctx.db.patch(user._id, {
      weight: args.weight,
      weightIncrement: args.weightIncrement,
    });

    return user._id;
  },
});
