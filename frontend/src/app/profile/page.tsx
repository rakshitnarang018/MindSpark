import { createAdminClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { redirect } from "next/navigation";
import ProfileSummary from "./_components/ProfileSummary";
import ProfileForm from "./_components/ProfileForm";

export const metadata = {
  title: "Profile | MindSpark",
  description: "Manage your student profile and learning preferences",
};

export default async function Page() {
  const cUser = await currentUser();

  if (!cUser) {
    redirect("/");
  }

  // Use admin client for user creation (bypasses RLS)
  const supabase = await createAdminClient();

  let user = null;
  
  // Try to get existing user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("sub", cUser.id)
    .single();

  if (existingUser) {
    user = existingUser;
  } else {
    // Create new user with admin client
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        sub: cUser.id,
        email: cUser.emailAddresses[0]?.emailAddress,
        first_name: cUser.firstName,
        last_name: cUser.lastName,
        user_type: 'student'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      // Handle error appropriately
      redirect("/error");
    }
    
    user = newUser;
    console.log("Created user successfully:", user.id);
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from("student_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile information and learning preferences
          </p>
        </div>

        <ProfileSummary user={user} studentProfile={studentProfile} />
        <ProfileForm user={user} studentProfile={studentProfile} />
      </div>
    </div>
  );
}
