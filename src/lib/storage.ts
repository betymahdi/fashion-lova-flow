import { supabase } from "@/integrations/supabase/client";
import { getUploadUrl } from "./api/upload.functions";

const BUCKET = "product-images";

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const { token, path, publicUrl } = await getUploadUrl({
    data: { ext, contentType: file.type },
  });

  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });
  if (error) throw error;

  return publicUrl;
}

export async function deleteProductImage(url: string) {
  try {
    const match = url.match(/product-images\/([^?]+)/);
    if (!match) return;
    await supabase.storage.from(BUCKET).remove([match[1]]);
  } catch {}
}
