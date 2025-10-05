import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all weights for a user
export const getUserWeights = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const weights = await ctx.db
      .query("weights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by weight descending
    return weights.sort((a, b) => b.weight - a.weight);
  },
});

// Initialize default weights for a user
export const initializeDefaultWeights = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user already has weights configured
    const existingWeights = await ctx.db
      .query("weights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingWeights) {
      return; // User already has weights configured
    }

    // Default weights: 2 of each standard plate
    const defaultWeights = [
      { weight: 45, quantity: 2 },
      { weight: 35, quantity: 2 },
      { weight: 25, quantity: 2 },
      { weight: 10, quantity: 2 },
      { weight: 5, quantity: 2 },
      { weight: 2.5, quantity: 2 },
    ];

    const now = Date.now();

    for (const w of defaultWeights) {
      await ctx.db.insert("weights", {
        userId: args.userId,
        weight: w.weight,
        quantity: w.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update or create a weight
export const setWeight = mutation({
  args: {
    userId: v.id("users"),
    weight: v.number(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if this weight already exists for the user
    const existing = await ctx.db
      .query("weights")
      .withIndex("by_user_and_weight", (q) =>
        q.eq("userId", args.userId).eq("weight", args.weight)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing weight
      if (args.quantity <= 0) {
        // Delete if quantity is 0 or less
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, {
          quantity: args.quantity,
          updatedAt: now,
        });
      }
    } else if (args.quantity > 0) {
      // Create new weight
      await ctx.db.insert("weights", {
        userId: args.userId,
        weight: args.weight,
        quantity: args.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Delete a weight
export const deleteWeight = mutation({
  args: {
    userId: v.id("users"),
    weightId: v.id("weights"),
  },
  handler: async (ctx, args) => {
    const weight = await ctx.db.get(args.weightId);

    if (!weight || weight.userId !== args.userId) {
      throw new Error("Weight not found or unauthorized");
    }

    await ctx.db.delete(args.weightId);
  },
});

// Get bar weight setting (default 45 lbs)
export const getBarWeight = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    // For now, return default. Could add a barWeight field to users table later
    return 45;
  },
});
