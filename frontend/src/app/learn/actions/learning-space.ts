"use server";

import { createAdminClient } from "@/utils/supabase/server"; // CHANGED: Use admin client

export async function createLearningSpaceAction(
  topic: string,
  userId: string,
  pdfSource?: string | null,
  audioSource?: string | null
) {
  const supabase = createAdminClient(); // CHANGED: Use admin client (no await needed)

  // Insert the learning space
  const { data, error } = await supabase
    .from("learning_space")
    .insert({
      topic,
      user_id: userId,
      pdf_source: pdfSource || null,
      audio_source: audioSource || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating learning space:", error);
    return {
      error: "Failed to create learning space",
    };
  }

  return { data, success: true };
}

export async function uploadSourceFileAction(
  file: File,
  userId: string,
  spaceId: string
) {
  const supabase = createAdminClient(); // CHANGED: Use admin client

  const assetName = `public/sources/${userId}/${spaceId}/${file.name}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("learning-sources")
    .upload(assetName, file);

  if (error) {
    console.error("Error uploading source file:", error);
    return {
      error: "Failed to upload source file",
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from("learning-sources")
    .getPublicUrl(assetName);

  return {
    data,
    success: true,
    assetName: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function invokeAgentWorkflow(
  learningSpaceId: string,
  userId: string
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_AGENT_API}/api/workflows/invoke`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        learning_space_id: learningSpaceId,
        user_id: userId,
      }),
    }
  );

  if (!res.ok) {
    console.error("Error invoking agent workflow:", res.statusText);
    return {
      error: "Failed to invoke agent workflow",
    };
  }
  const data = await res.json();
  return {
    data,
    success: true,
  };
}

export async function generateAudioAction(
  learningSpaceId: string,
  userId: string
) {
  console.log(learningSpaceId, userId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_AGENT_API}/api/workflows/audio-summary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        learning_space_id: learningSpaceId,
        user_id: userId,
      }),
    }
  );

  if (!res.ok) {
    console.error("Error invoking agent workflow:", res.statusText);
    return {
      error: "Failed to invoke agent workflow",
    };
  }
  const data = await res.json();

  if (data.success) {
    console.log("Audio generated successfully:", data);
    return {
      success: true,
      audio_url: data.audio_url,
    };
  }
  console.error("Error generating audio:", data.error);
  return {
    error: data.error || "Failed to generate audio",
  };
}