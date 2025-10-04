import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // For development, return a demo user
    // In production, implement proper authentication
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

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
    // For development, always use demo user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@example.com"))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: "demo@example.com", // Always use demo email
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
