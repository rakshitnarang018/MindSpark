import React from "react";
import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UploadedSources from "./_components/sources";
import Recommendations from "./_components/recommendations";
import AudioOverview from "./_components/audio-overview";
import Quiz from "./_components/quiz";
import SummaryNotes from "./_components/summary-notes";
import Mindmap from "./_components/mindmap";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateMetadata() {
  return {
    title: `Learning Space`,
    description: `AI-powered learning space`,
  };
}

export default async function LearningSpacePage({ params }: PageProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn">
            <Button
              variant="ghost"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Learning Spaces
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {learningSpace.topic || learningSpace.topic_name}
              </h1>
              <p className="text-gray-600">
                Created {formatDate(learningSpace.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Notes */}
            <SummaryNotes
              learningSpaceId={learningSpace.id}
              summaryNotes={learningSpace.summary_notes}
            />

            {/* Mind Map */}
            <Mindmap
              learningSpaceId={learningSpace.id}
              mindmap={learningSpace["mindmap"]}
            />

            {/* Recommendations */}
            <Recommendations
              learningSpaceId={learningSpace.id}
              recommendations={
                learningSpace.recommendations?.recommendations || []
              }
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Uploaded Sources */}
            <UploadedSources learningSpace={learningSpace} />

            {/* Audio Overview */}

            <AudioOverview
              learningSpaceId={learningSpace.id}
              userId={user.id}
              audio_overview={learningSpace["audio_overview"]}
            />

            {/* Quiz */}
            <Quiz
              learningSpaceId={learningSpace.id}
              isQuizGenerated={learningSpace.quiz}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
