import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import LottieView from "lottie-react-native";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", (err as Error).message);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        Alert.alert("Code is not correct");
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", (err as Error).message);
    }
  };

  if (pendingVerification) {
    return (
      <View className="p-4 pt-20 gap-4 flex-1 bg-white">
        <Text className="text-2xl">Email Verifizieren</Text>

        <TextInput
          value={code}
          placeholder="Geben Sie Ihren Bestätigungscode ein"
          onChangeText={(code) => setCode(code)}
          className="border border-neutral-400 p-4 rounded-lg"
        />
        <TouchableOpacity
          onPress={onVerifyPress}
          className="bg-[#6C63FF] p-4 rounded-full items-center"
        >
          <Text className="font-semibold text-white">Verifizieren</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="pt-16 p-4 gap-4 flex-1 bg-white">
      <>
        <View className=" pb-4 flex-row items-center  justify-between">
          <Text className="text-2xl font-semibold self-end">Registrieren</Text>
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
          onChangeText={(email) => setEmailAddress(email)}
          className="border border-neutral-400 p-4 rounded-xl"
        />
        <TextInput
          value={password}
          placeholder="Passwort"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          className="border border-neutral-400 p-4 rounded-xl"
        />
        <TextInput
          autoCapitalize="none"
          value={firstName}
          placeholder="Vorname"
          onChangeText={(firstName) => setFirstName(firstName)}
          className="border border-neutral-400 p-4 rounded-xl"
        />
        <TextInput
          autoCapitalize="none"
          value={lastName}
          placeholder="Nachname"
          onChangeText={(lastName) => setLastName(lastName)}
          className="border border-neutral-400 p-4 rounded-xl"
        />

        <TouchableOpacity
          onPress={onSignUpPress}
          className="bg-[#6C63FF] p-4 rounded-full items-center"
        >
          <Text className="font-semibold text-white text-lg">Weiter</Text>
        </TouchableOpacity>

        <View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
          <Text>Bereits einen Nutzer?</Text>
          <Link href="/sign-in">
            <Text className="text-[#6C63FF] font-bold">Einloggen</Text>
          </Link>
        </View>
      </>
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
