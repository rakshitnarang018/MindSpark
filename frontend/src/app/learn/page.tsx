import React from "react";
import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LearningSpacesManager from "./_components/LearningSpacesManager";

export const metadata = {
  title: "Learn",
  description: "Learn with AI-powered personalized learning",
};

export default async function Page() {
  // get the current user
  const cUser = await currentUser();

  if (!cUser) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("sub", cUser?.id)
    .single();

  if (!user) {
    redirect("/profile");
  }

  const { data: studentProfile } = await supabase
    .from("student_profile")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // If no student profile exists, show the profile creation dialog
  if (!studentProfile) {
    redirect("/profile");
  }

  // Fetch learning spaces for the user
  const { data: learningSpaces } = await supabase
    .from("learning_space")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <LearningSpacesManager
        userId={user.id}
        initialSpaces={learningSpaces || []}
      />
    </div>
  );
}
