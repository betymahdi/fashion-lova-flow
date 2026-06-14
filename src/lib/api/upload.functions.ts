import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "product-images";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ext: z.string(), contentType: z.string() }))
  .handler(async ({ data }) => {
    const path = `${crypto.randomUUID()}.${data.ext}`;

    const { data: uploadData, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !uploadData) throw new Error(error?.message ?? "Upload URL failed");

    const { data: signedUrl, error: sErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, TEN_YEARS);
    if (sErr || !signedUrl) throw new Error(sErr?.message ?? "Signed URL failed");

    return { token: uploadData.token, path, publicUrl: signedUrl.signedUrl };
  });
