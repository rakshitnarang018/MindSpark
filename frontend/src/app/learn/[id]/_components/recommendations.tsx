"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Lightbulb, ExternalLink } from "lucide-react";
import React, { useState, useEffect } from "react";

type Recommendation = {
  title: string;
  description: string;
  url: string | null;
};

export default function Recommendations({
  learningSpaceId,
  recommendations,
}: {
  learningSpaceId: string;
  recommendations?: Recommendation[];
}) {
  const [isGenerating, setIsGenerating] = useState(
    recommendations?.length == 0 ? true : false
  );
  const [recommendationsList, setRecommendationsList] = useState(
    recommendations || []
  );

  const client = createClient();

  useEffect(() => {
    // get realtime update for quiz if it has been generated
    const channelName = "channel:recommendations";
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
          // console.log("realtime update for summary notes:");
          // console.log(payload);
          //@ts-expect-error this exists
          if (payload.new?.recommendations) {
            setIsGenerating(false);
            //@ts-expect-error this exists
            setRecommendationsList(payload.new.recommendations.recommendations);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`Successfully subscribed to the channel! ${channelName}`);
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

  if (isGenerating) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            Generating Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Lightbulb className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
          <p className="text-sm text-gray-600">
            Please wait while we generate personalized learning resources for
            you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          Recommended Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendationsList && recommendationsList.length > 0 ? (
          recommendationsList.map((rec, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-yellow-200 hover:border-yellow-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                {rec.url && rec.url !== "NULL" && (
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">
              No recommendations available yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Check back soon for personalized learning resources!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
