import { createClient } from "@/lib/supabase/server";

const BUCKET = "ingredient-documents";

export async function createDocumentSignedUrl(
  storagePath: string,
  expiresIn = 3600,
): Promise<string | null> {
  if (storagePath.startsWith("local://")) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "No se pudo generar URL de descarga");
  }

  return data.signedUrl;
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  if (storagePath.startsWith("local://")) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    throw new Error(error.message);
  }
}
