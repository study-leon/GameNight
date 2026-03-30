import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadImage(
  supabase: SupabaseClient,
    uri: string,
    mimeType: string = "image/jpeg",
) {
    const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());

    const fileName = uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
    const path = `${Date.now()}.${fileName}`;


    const { data, error } = await supabase.storage.from("Medien").upload(path, arraybuffer, {
        contentType: mimeType,
    });

if (error) {
        console.log("Supabase Storage Upload Error:", error);
        throw new Error(error.message);
    }
    console.log("Uploaded file path:", data.path);
    return data.path;

}