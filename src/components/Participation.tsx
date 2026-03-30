import { View, Text, Pressable } from "react-native";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Events, User } from "@/types";

type ParticipationProps = {
  event: Events | null;
};

export default function Participation({ event }: ParticipationProps) {
  const supabase = useSupabase();
  const { user } = useUser();

  if (!user) return null;

  // ✅ 1. Query: nimmt der aktuelle User teil?
  const { data: attendance, refetch: refetchAttendance } = useQuery({
    queryKey: ["attendance", event?.id, user.id],
    enabled: !!event?.id && !!user.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("event_id", event!.id)
        .eq("user_id", user.id)
        .maybeSingle(); // null oder row

      if (error) {
        console.error("Attendance query error:", error);
        throw error;
      }

      return data; // null oder row
    },
  });

  // ✅ 2. Query: alle teilnehmenden User
  const { data: participants = [], refetch: refetchParticipants } = useQuery<
    User[]
  >({
    queryKey: ["event-participants", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data: attendanceRows, error: attendanceError } = await supabase
        .from("attendance")
        .select("user_id")
        .eq("event_id", event!.id)
        .eq("is_going", true);

      if (attendanceError) {
        console.error("Attendance list error:", attendanceError);
        throw attendanceError;
      }

      const userIds = (attendanceRows ?? [])
        .map((a) => a.user_id)
        .filter((id): id is string => id !== null);

      if (userIds.length === 0) return [];

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);

      if (usersError) {
        console.error("Participants users error:", usersError);
        throw usersError;
      }

      return (users ?? []) as User[];
    },
  });

  const refetchAll = () => {
    refetchAttendance();
    refetchParticipants();
  };

  const participateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("attendance").insert({
        event_id: event?.id,
        user_id: user.id,
        is_going: true,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => refetchAll(),
    onError: (error) => {
      console.error("Error participating in event:", error);
    },
  });

  const unparticipateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("event_id", event!.id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => refetchAll(), // ✅ hier auch beide refetchen
    onError: (error) => {
      console.error("Error unparticipating from event:", error);
    },
  });

  const isGoing = !!attendance;

  return (
    <View className="px-4 w-[90%]">
      <Text className="text-2xl font-bold mb-2 text-white">
        Wer kommt ({participants.length})
      </Text>
      <View className="border-t border-gray-300 py-2">
        <View className="flex-row gap-2 mt-2">
          {participants.length === 0 && (
            <Text className="text-gray-300">Noch keine Teilnehmer</Text>
          )}

          {participants.map((p) => {
            const initial =
              p.first_name?.charAt(0).toUpperCase() ??
              p.full_name?.charAt(0).toUpperCase() ??
              "?";

            return (
              <View key={p.id} className="items-center mr-3">
                <View className="w-10 h-10 rounded-full bg-[#6C63FF] justify-center items-center">
                  <Text className="text-white font-bold">{initial}</Text>
                </View>
                <Text className="text-white">
                  {p.first_name ?? p.full_name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() =>
          isGoing
            ? unparticipateMutation.mutate()
            : participateMutation.mutate()
        }
        className="bg-[#6C63FF] p-4 mt-1 rounded-xl"
      >
        <Text className="text-white text-center text-xl">
          {isGoing ? "Nicht teilnehmen" : "Teilnehmen"}
        </Text>
      </Pressable>
    </View>
  );
}
