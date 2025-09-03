import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BadgeQuestionMark, Map, Music, NotebookText } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg
                className="w-14 h-14 text-white drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Study Smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Study Your Way.
              </span>
            </h1>
            <p className="text-2xl text-gray-700 max-w-2xl mx-auto mb-10 font-medium">
              The AI-powered platform for students to learn, revise, and master
              any subject. Instantly get summary notes, audio overviews,
              mindmaps, interactive quizzes, and more—tailored just for you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="px-10 py-6 text-lg font-bold shadow-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Start Free
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-6 text-lg font-bold shadow-md"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/learn">
                <Button
                  size="lg"
                  className="px-10 py-6 text-lg font-bold shadow-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Go to My Learning
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/60 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              All Your Study Tools. One Place.
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Everything you need to learn, revise, and master your
              subjects—powered by AI and designed just for students.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-10">
            {/* Feature 1: Summary Notes */}
            <Card className="text-center border-0 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <div className="text-white w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <NotebookText />
                </div>
                <CardTitle className="text-xl font-bold">
                  Summary Notes
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Instantly generate concise, easy-to-revise notes for any topic
                  or file.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Audio Overview */}
            <Card className="text-center border-0 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 bg-gradient-to-br from-orange-50 to-amber-100">
              <CardHeader>
                <div className="text-white w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Music />
                </div>
                <CardTitle className="text-xl font-bold">
                  Audio Overview
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Listen to AI-generated audio summaries—perfect for revision on
                  the go.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Mindmaps */}
            <Card className="text-center border-0 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 bg-gradient-to-br from-purple-50 to-pink-100">
              <CardHeader>
                <div className="text-white w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Map />
                </div>
                <CardTitle className="text-xl font-bold">Mindmaps</CardTitle>
                <CardDescription className="text-gray-700">
                  Visualize concepts and their connections with interactive
                  mindmaps.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Interactive Quizzes */}
            <Card className="text-center border-0 shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 bg-gradient-to-br from-green-50 to-emerald-100">
              <CardHeader>
                <div className="text-white w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <BadgeQuestionMark />
                </div>
                <CardTitle className="text-xl font-bold">
                  Interactive Quizzes
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Test your knowledge with smart, adaptive quizzes and instant
                  feedback.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of educators and students who are already
            experiencing the future of education with MindSpark.
          </p>
          <SignedOut>
            <SignUpButton>
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                Start Learning Today
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/learn">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                Continue Learning
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">MindSpark</h3>
          <p className="text-gray-400 mb-6">
            Transforming education through AI-powered personalized learning
          </p>
          <div className="text-sm text-gray-500">
            © 2025 MindSpark. All rights reserved.
          </div>

          <div className="mt-6 text-gray-400">
            Created by{" "}
            <span className="text-blue-400 hover:underline">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
              >
                MindSpark Team
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
