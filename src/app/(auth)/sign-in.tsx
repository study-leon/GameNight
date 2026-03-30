import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Alert,
  Button,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import LottieView from "lottie-react-native";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));

      Alert.alert("Error", (err as Error).message);
    }
  };

  return (
    <View className="pt-20 p-4  gap-4 bg-white flex-1">
      <View className=" pb-4 flex-row items-center  justify-between">
        <Text className="text-2xl self-end font-semibold">Einloggen</Text>
        <View className="w-32 h-20 ">
          <Image
            source={require("../../../assets/GameNight.png")}
            className="w-full h-full object-contain "
          />
        </View>
      </View>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email "
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        className="border border-neutral-400 p-4 rounded-lg"
      />
      <TextInput
        value={password}
        placeholder="Passwort"
        secureTextEntry={true}
        className="border border-neutral-400 p-4 rounded-lg"
        onChangeText={(password) => setPassword(password)}
      />
      <TouchableOpacity
        onPress={onSignInPress}
        className="bg-[#6C63FF] p-4 rounded-full text-white items-center"
      >
        <Text className="font-semibold text-white text-lg">Weiter</Text>
      </TouchableOpacity>
      <View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
        <Text>Noch keinen Nutzer?</Text>
        <Link href="/sign-up">
          <Text className="text-[#6C63FF] font-bold">Registrieren</Text>
        </Link>
      </View>

      <View className="flex-1 justify-center items-center mb-4  ">
        <LottieView
          source={require("../../../assets/welcome.json")}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    </View>
  );
}
