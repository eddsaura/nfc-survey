import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);

  const signInWithGoogle = async () => {
    await signIn("google");
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signIn("password", { email, password, flow: "signIn" });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await signIn("password", { email, password, flow: "signUp" });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,
  };
}
