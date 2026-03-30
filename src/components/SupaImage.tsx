import React from "react";
import { Image, ImageProps } from "react-native";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";

type SupaImageProps = {
  path: string;
} & ImageProps;

export default function SupaImage({ path, ...imageProps }: SupaImageProps) {
  const supabase = useSupabase();

  const { data } = useQuery({
    queryKey: ["supa-image", path],
    queryFn: async () => {
      const { data } = await supabase.storage
        .from("Medien")
        .createSignedUrl(path, 3600);
      return data?.signedUrl;
    },
  });

  return <Image {...imageProps} source={{ uri: data }} />;
}
