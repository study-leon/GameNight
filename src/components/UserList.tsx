import { Alert, FlatList, View, Text } from "react-native";

import UserListItem from "./UserListItem";

import { useSupabase } from "@/providers/SupabaseProvider";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";

import LottieView from "lottie-react-native";

type User = Tables<"users">;

type UserListItemProps = {
  onPress?: (user: User) => void;
};

export default function UserList({ onPress }: UserListItemProps) {
  const supabase = useSupabase();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .neq("id", user?.id)
        .throwOnError();
      console.log("user list data", data);

      return data;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1  justify-center  items-center absolute w-full h-full bg-white top-80">
        <LottieView
          source={require("../../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    );
  }

  if (error) {
    return <Text>{error.message}</Text>;
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <UserListItem user={item} onPress={onPress} />}
    />
  );
}
