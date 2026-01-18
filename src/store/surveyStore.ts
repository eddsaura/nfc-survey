import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

interface VoteState {
  surveyId: Id<"surveys"> | null;
  voteId: Id<"votes"> | null;
  response: "yes" | "no" | null;
}

interface SurveyStore {
  currentVote: VoteState;
  setCurrentVote: (vote: Partial<VoteState>) => void;
  clearCurrentVote: () => void;

  selectedSurveyForWriting: Id<"surveys"> | null;
  setSelectedSurveyForWriting: (surveyId: Id<"surveys"> | null) => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  currentVote: {
    surveyId: null,
    voteId: null,
    response: null,
  },
  setCurrentVote: (vote) =>
    set((state) => ({
      currentVote: { ...state.currentVote, ...vote },
    })),
  clearCurrentVote: () =>
    set({
      currentVote: {
        surveyId: null,
        voteId: null,
        response: null,
      },
    }),

  selectedSurveyForWriting: null,
  setSelectedSurveyForWriting: (surveyId) =>
    set({ selectedSurveyForWriting: surveyId }),
}));
