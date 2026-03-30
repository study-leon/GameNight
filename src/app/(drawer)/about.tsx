import { Text, View, Button } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useSupabase } from "@/providers/SupabaseProvider";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const supabase = useSupabase();
  const testInsert = async () => {
    const { data, error } = await supabase
      .from("Test")
      .insert({ test: "testing 2" });
    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted successfully:", data);
    }
  };

  const testFetch = async () => {
    const { data, error } = await supabase.from("Test").select("*");
    console.log(JSON.stringify(data, null, 2));
  };

  return (
    <View className="flex-1 items-center justify-center ">
      <Text className="text-3xl ">Setting</Text>

      <Button
        onPress={() => {
          signOut();
        }}
        title="Sign Out"
      />
      <Button onPress={testInsert} title="Test Insert Function" />
      <Button onPress={testFetch} title="Test Fetch Function" />
    </View>
  );
}
