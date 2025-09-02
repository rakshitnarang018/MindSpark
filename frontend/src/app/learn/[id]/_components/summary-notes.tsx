"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type SummaryNotes = {
  title: string;
  summary: string;
};

export default function SummaryNotes({
  learningSpaceId,
  summaryNotes,
}: {
  learningSpaceId: string;
  summaryNotes?: SummaryNotes | null;
}) {
  const client = createClient();
  const [isGenerating, setIsGenerating] = useState(summaryNotes ? false : true);
  const [summaryNotesContent, setSummaryNotesContent] = useState(
    summaryNotes?.summary
  );

  useEffect(() => {
    // get realtime update for quiz if it has been generated
    const channelName = "channel:summary-notes";
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
          if (payload.new?.summary_notes) {
            setIsGenerating(false);
            //@ts-expect-error this exists
            setSummaryNotesContent(payload.new.summary_notes.summary);
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

  return (
    <Card className="bg-white border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Summary Notes
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isGenerating ? (
          <>
            {/* Summary Notes Content */}
            <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
              {/* Rendered Markdown Content */}
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                <ReactMarkdown>{summaryNotesContent}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Generating State */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Generating Summary Notes...
              </h4>

              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our AI is analyzing your learning materials to create
                comprehensive summary notes with key concepts and learning
                points.
              </p>

              {/* Progress indicators */}
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
