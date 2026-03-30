import LottieView from "lottie-react-native";

export default function Background() {
  return (
    <LottieView
      source={require("@/../assets/background.json")}
      autoPlay
      loop
      resizeMode="cover"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}
