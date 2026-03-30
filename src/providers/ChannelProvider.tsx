import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { ChannelWithUsers } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

type ChannelContextType = {
  channel: ChannelWithUsers | null;
  realTimeChannel?: RealtimeChannel | null;
};

const ChannelContext = createContext<ChannelContextType>({
  channel: null,
});

type ChannelProviderProps = PropsWithChildren & {
  id: string;
};

export default function ChannelProvider({
  children,
  id,
}: ChannelProviderProps) {
  const { user } = useUser();
  const supabase = useSupabase();

  const [realTimeChannel, setRealTimeChannel] =
    useState<RealtimeChannel | null>();

  const queryClient = useQueryClient();

  const {
    data: channel,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["channels", id],
    queryFn: async () => {
      const { data: channel } = await supabase
        .from("channels")
        .select("*, users(*)")
        .eq("id", id)
        .throwOnError()
        .single();
      return channel;
    },
  });

  useEffect(() => {
    // 1. Enable self broadcast here
    const realTimeChannel = supabase.channel(`channel-${id}:messages`, {
      config: {
        broadcast: {
          self: true, // 👈 important!
        },
      },
    });

    function messageReceived(payload: any) {
      console.log("Realtime Payload::::");
      console.log("RECEIVED PAYLOAD:", payload);

      queryClient.setQueryData(["messages", id], (oldData: any) => [
        payload.payload,
        ...oldData,
      ]);
    }

    realTimeChannel.on("broadcast", { event: "message_sent" }, (payload) =>
      messageReceived(payload)
    );

    realTimeChannel.subscribe((status) => {
      console.log("STATUS:", status);

      if (status !== "SUBSCRIBED") return;

      setRealTimeChannel(realTimeChannel);
    });

    // optional but good practice
    return () => {
      if (realTimeChannel) {
        supabase.removeChannel(realTimeChannel);
      }
      setRealTimeChannel(null);
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center mb-4  ">
        <LottieView
          source={require("../../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    );
  }

  if (error || !channel) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl">Chat nicht gefunden</Text>
      </View>
    );
  }

  return (
    <ChannelContext.Provider value={{ channel, realTimeChannel }}>
      {children}
    </ChannelContext.Provider>
  );
}

export const useChannel = () => useContext(ChannelContext);
