import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    surveyId: v.id("surveys"),
    voteId: v.id("votes"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.union(v.string(), v.number(), v.array(v.string())),
      })
    ),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    if (!vote) {
      throw new Error("Vote not found");
    }
    if (vote.deviceId !== args.deviceId) {
      throw new Error("Device mismatch");
    }

    const existingResponse = await ctx.db
      .query("followUpResponses")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .first();

    if (existingResponse) {
      throw new Error("Follow-up already submitted for this vote");
    }

    await ctx.db.insert("followUpResponses", {
      surveyId: args.surveyId,
      voteId: args.voteId,
      answers: args.answers,
      deviceId: args.deviceId,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getResponses = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("followUpResponses")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    return responses;
  },
});

export const getSummary = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) {
      return null;
    }

    const responses = await ctx.db
      .query("followUpResponses")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    const summary: Record<
      string,
      { question: string; type: string; answers: Record<string, number> }
    > = {};

    for (const question of survey.followUpQuestions) {
      summary[question.id] = {
        question: question.question,
        type: question.type,
        answers: {},
      };

      for (const response of responses) {
        const answer = response.answers.find((a) => a.questionId === question.id);
        if (answer) {
          const answerKey = Array.isArray(answer.answer)
            ? answer.answer.join(", ")
            : String(answer.answer);
          summary[question.id].answers[answerKey] =
            (summary[question.id].answers[answerKey] || 0) + 1;
        }
      }
    }

    return summary;
  },
});
