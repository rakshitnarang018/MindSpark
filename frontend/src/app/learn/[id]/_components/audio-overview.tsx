"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Play, Pause, RefreshCw } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { generateAudioAction } from "../../actions/learning-space";
import { createClient } from "@/utils/supabase/client";

export default function AudioOverview({
  learningSpaceId,
  userId,
  audio_overview: initialAudioOverview,
}: {
  learningSpaceId: string;
  userId: string;
  audio_overview: string | null;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioOverview, setAudioOverview] = useState<string | null>(initialAudioOverview);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Realtime subscription for audio updates
  useEffect(() => {
    const supabase = createClient();
    
    console.log("Setting up audio-overview realtime subscription");
    
    const channel = supabase
      .channel(`audio-overview`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "learning_space",
          filter: `id=eq.${learningSpaceId}`,
        },
        (payload) => {
          console.log("Realtime audio update received:", payload);
          if (payload.new?.audio_overview) {
            console.log("New audio URL:", payload.new.audio_overview);
            setAudioOverview(payload.new.audio_overview);
            
            // Update audio element with new source
            if (audioRef.current) {
              audioRef.current.src = payload.new.audio_overview;
              audioRef.current.load();
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to audio-overview channel!");
        }
      });

    return () => {
      console.log("Cleaning up audio-overview subscription");
      supabase.removeChannel(channel);
    };
  }, [learningSpaceId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioOverview]); // Changed dependency from audio_overview to audioOverview

  const handleGenerateAudio = async () => {
    setIsGenerating(true);

    const res = await generateAudioAction(learningSpaceId, userId);

    if (res.error) {
      console.error("Error generating audio:", res.error);
      setIsGenerating(false);
    } else {
      console.log("Audio generated successfully:", res);
      setIsGenerating(false);
      // Audio will be updated via realtime subscription
      // No need to manually update here
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            Audio Overview
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audioOverview ? (
          <>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={audioOverview} preload="metadata" />

            {/* Audio Player Section */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlayback}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-full w-12 h-12 p-0"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Learning Overview Audio
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          duration > 0
                            ? `${(currentTime / duration) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Info */}
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <p className="text-sm text-gray-600">
                AI-generated audio summary covering key concepts, important
                points, and learning objectives from your materials.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* No Audio State */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-orange-500" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Audio Overview Yet
              </h3>

              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Generate an AI-powered audio summary of your learning materials
                to listen on the go.
              </p>

              <Button
                onClick={handleGenerateAudio}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate Audio Overview
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}