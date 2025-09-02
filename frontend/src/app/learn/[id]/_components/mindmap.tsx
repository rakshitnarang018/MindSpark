/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Mindmap({
  learningSpaceId,
  mindmap,
}: {
  learningSpaceId: string;
  mindmap: string | null;
}) {
  const [isGenerating, setIsGenerating] = useState(mindmap ? false : true);
  const [mindmapUrl, setMindmapUrl] = useState(mindmap);

  const client = createClient();

  useEffect(() => {
    // get realtime update for quiz if it has been generated
    const channelName = "channel:mindmap";
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
          if (payload.new?.mindmap) {
            setIsGenerating(false);
            //@ts-expect-error this exists
            setMindmapUrl(payload.new.mindmap);
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

  const handleDownload = () => {
    if (mindmapUrl) {
      window.open(mindmapUrl, "_blank");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            Concept Mind Map
          </div>
          {!isGenerating && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isGenerating ? (
          <>
            {/* Mindmap Image Display */}
            {mindmapUrl && (
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <img
                  src={mindmapUrl}
                  alt="mindmap"
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* Mindmap Info */}
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="text-sm text-gray-600">
                🧠 AI-generated visual mind map showing the relationships
                between key concepts and topics from your learning materials.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Loading State */}
            <div className="bg-white rounded-lg p-6 min-h-[400px]">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generating Mind Map...
                </h3>

                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  AI is creating a visual mind map showing the relationships
                  between key concepts from your learning materials.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
