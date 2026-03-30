import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/home" />; // z.B. app/(drawer)/home.tsx
  }

  return <Redirect href="/sign-in" />;
}
