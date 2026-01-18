import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    question: v.string(),
    followUpQuestions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.union(
            v.literal("multiple_choice"),
            v.literal("rating"),
            v.literal("text"),
            v.literal("yes_no")
          ),
          question: v.string(),
          options: v.optional(v.array(v.string())),
          min: v.optional(v.number()),
          max: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const surveyId = await ctx.db.insert("surveys", {
      title: args.title,
      question: args.question,
      followUpQuestions: args.followUpQuestions ?? [],
      isActive: true,
      createdAt: Date.now(),
    });
    return surveyId;
  },
});

export const get = query({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("surveys")
      .order("desc")
      .collect();
  },
});

export const toggleActive = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.id);
    if (!survey) {
      throw new Error("Survey not found");
    }
    await ctx.db.patch(args.id, { isActive: !survey.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
