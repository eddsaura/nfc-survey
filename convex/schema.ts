import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  surveys: defineTable({
    title: v.string(),
    question: v.string(),
    followUpQuestions: v.array(
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
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  votes: defineTable({
    surveyId: v.id("surveys"),
    response: v.union(v.literal("yes"), v.literal("no")),
    deviceId: v.string(),
    timestamp: v.number(),
  })
    .index("by_survey", ["surveyId"])
    .index("by_device_and_survey", ["deviceId", "surveyId"]),

  followUpResponses: defineTable({
    surveyId: v.id("surveys"),
    voteId: v.id("votes"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.union(v.string(), v.number(), v.array(v.string())),
      })
    ),
    deviceId: v.string(),
    timestamp: v.number(),
  })
    .index("by_survey", ["surveyId"])
    .index("by_vote", ["voteId"]),
});
