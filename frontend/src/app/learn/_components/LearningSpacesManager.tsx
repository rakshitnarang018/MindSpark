"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateSpaceButton from "./CreateSpaceButton";
import LearningSpacesList from "./LearningSpacesList";
import {
  createLearningSpaceAction,
  invokeAgentWorkflow,
  uploadSourceFileAction,
} from "../actions/learning-space";

interface LearningSpace {
  id: string;
  topic: string;
  description?: string;
  created_at: string;
  user_id: string;
}

interface LearningSpacesManagerProps {
  userId: string;
  initialSpaces: LearningSpace[];
}

export default function LearningSpacesManager({
  userId,
  initialSpaces,
}: LearningSpacesManagerProps) {
  const [spaces, setSpaces] = useState<LearningSpace[]>(initialSpaces);
  const router = useRouter();

  const handleCreateSpace = async (spaceData: {
    topic: string;
    pdfFile?: File | null;
    audioFile?: File | null;
  }) => {
    try {
      let pdfSource: string | null = null;
      //   let audioSource: string | null = null;
      if (spaceData.pdfFile) {
        const response = await uploadSourceFileAction(
          spaceData.pdfFile,
          userId,
          spaceData.topic
        );

        if (response.error) {
          throw new Error("Failed to upload PDF file");
        }
        // You can handle the response data if needed
        pdfSource = response.publicUrl || null;
      }

      const response = await createLearningSpaceAction(
        spaceData.topic,
        userId,
        pdfSource
      );
      if (!response.error) {
        console.log(response.data);
        setSpaces((prev) => [response.data, ...prev]);

        // // invoke workflow

        const res = await invokeAgentWorkflow(response.data.id, userId);
        if (res.error) {
          console.error("Error invoking agent workflow:", res.error);
          // Handle error (maybe show a toast notification)
        } else {
          console.log("Agent workflow invoked successfully:", res.data);
        }
        // Optionally, you can redirect to the newly created space
        router.push(`/learn/${response.data.id}`);
      } else {
        throw new Error("Failed to create learning space");
      }
    } catch (error) {
      console.error("Error creating learning space:", error);
      // You could add a toast notification here
    }
  };

  const handleSpaceClick = (spaceId: string) => {
    router.push(`/learn/${spaceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Learning Spaces
            </h1>
            <p className="text-gray-600">
              Create dedicated spaces for different topics and track your
              learning progress.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <CreateSpaceButton onCreateSpace={handleCreateSpace} />
          </div>
        </div>

        {/* Learning Spaces List */}
        <LearningSpacesList spaces={spaces} onSpaceClick={handleSpaceClick} />
      </div>
    </div>
  );
}
