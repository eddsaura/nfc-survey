import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const surveyId = await ctx.db.insert("surveys", {
      title: args.title,
      question: args.question,
      followUpQuestions: args.followUpQuestions ?? [],
      isActive: true,
      createdAt: Date.now(),
      userId,
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

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("surveys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const toggleActive = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const survey = await ctx.db.get(args.id);
    if (!survey) {
      throw new Error("Survey not found");
    }
    if (survey.userId !== userId) {
      throw new Error("Not authorized to modify this survey");
    }
    await ctx.db.patch(args.id, { isActive: !survey.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const survey = await ctx.db.get(args.id);
    if (!survey) {
      throw new Error("Survey not found");
    }
    if (survey.userId !== userId) {
      throw new Error("Not authorized to delete this survey");
    }
    await ctx.db.delete(args.id);
  },
});

export const listMineWithResults = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const surveys = await ctx.db
      .query("surveys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const surveysWithResults = await Promise.all(
      surveys.map(async (survey) => {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_survey", (q) => q.eq("surveyId", survey._id))
          .collect();

        const yesCount = votes.filter((v) => v.response === "yes").length;
        const noCount = votes.filter((v) => v.response === "no").length;
        const total = votes.length;

        return {
          ...survey,
          results: {
            total,
            yes: yesCount,
            no: noCount,
            yesPercentage: total > 0 ? (yesCount / total) * 100 : 0,
            noPercentage: total > 0 ? (noCount / total) * 100 : 0,
          },
        };
      })
    );

    return surveysWithResults;
  },
});
