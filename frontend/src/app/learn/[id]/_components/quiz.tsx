"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Trophy, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Quiz({
  learningSpaceId,
  isQuizGenerated = false,
}: {
  learningSpaceId: string;
  isQuizGenerated?: boolean;
}) {
  const client = createClient();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(
    isQuizGenerated ? false : true
  );

  useEffect(() => {
    // get realtime update for quiz if it has been generated
    const channelName = `channel:quiz`;
    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "learning_space",
          filter: `id=eq.${learningSpaceId}`,
        },
        (payload) => {
          // console.log(payload);
          //@ts-expect-error this exists
          if (payload.new?.quiz) {
            setIsGenerating(false);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`Successfully subscribed to the channel ${channelName}!`);
          // You can now use the channel for Realtime operations
        } else {
          console.log(err);
          console.error(`Subscription failed: ${channelName}`, err);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [learningSpaceId, client]);

  const handleTakeQuiz = () => {
    router.push(`/learn/${learningSpaceId}/quiz`);
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          Knowledge Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quiz Description */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-start gap-3 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Test Your Knowledge
              </h4>
              <p className="text-sm text-gray-600">
                Challenge yourself with AI-generated questions based on your
                learning materials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~10 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Multiple choice</span>
            </div>
          </div>

          <Button
            onClick={handleTakeQuiz}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Take Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
