import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const cast = mutation({
  args: {
    surveyId: v.id("surveys"),
    response: v.union(v.literal("yes"), v.literal("no")),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) {
      throw new Error("Survey not found");
    }
    if (!survey.isActive) {
      throw new Error("Survey is no longer active");
    }

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_device_and_survey", (q) =>
        q.eq("deviceId", args.deviceId).eq("surveyId", args.surveyId)
      )
      .first();

    if (existingVote) {
      throw new Error("You have already voted on this survey");
    }

    const voteId = await ctx.db.insert("votes", {
      surveyId: args.surveyId,
      response: args.response,
      deviceId: args.deviceId,
      timestamp: Date.now(),
    });

    return {
      voteId,
      hasFollowUp: survey.followUpQuestions.length > 0,
    };
  },
});

export const hasVoted = query({
  args: {
    surveyId: v.id("surveys"),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_device_and_survey", (q) =>
        q.eq("deviceId", args.deviceId).eq("surveyId", args.surveyId)
      )
      .first();

    return existingVote !== null;
  },
});

export const getResults = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    const yesCount = votes.filter((v) => v.response === "yes").length;
    const noCount = votes.filter((v) => v.response === "no").length;

    return {
      total: votes.length,
      yes: yesCount,
      no: noCount,
      yesPercentage: votes.length > 0 ? (yesCount / votes.length) * 100 : 0,
      noPercentage: votes.length > 0 ? (noCount / votes.length) * 100 : 0,
    };
  },
});
