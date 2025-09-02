import React from "react";
import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import QuizSection from "./_components/quiz-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id: topicId } = await params;

  return {
    title: `Quiz - Learning Space ${topicId}`,
    description: `Take a quiz for your learning space`,
  };
}

export default async function QuizPage({ params }: PageProps) {
  const { id: topicId } = await params;

  // Get the current user
  const cUser = await currentUser();
  if (!cUser) {
    redirect("/");
  }

  const supabase = await createClient();

  // Get user from database
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("sub", cUser?.id)
    .single();

  if (!user) {
    redirect("/welcome");
  }

  // Fetch the specific learning space
  const { data: learningSpace } = await supabase
    .from("learning_space")
    .select("*")
    .eq("id", topicId)
    .single();

  if (!learningSpace) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Quiz Content */}
        <QuizSection quizData={learningSpace.quiz} />
      </div>
    </div>
  );
}
