"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  RotateCcw,
} from "lucide-react";

interface Question {
  hint: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  question: string;
  explaination: string;
  correctAnswer: string;
}

interface QuizData {
  title: string;
  questions: Question[];
}

interface QuizSectionProps {
  quizData: QuizData;
}

export default function QuizSection({ quizData }: QuizSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<string[]>(
    new Array(quizData.questions.length).fill("")
  );
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const progress =
    ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  const handleAnswerSelect = (option: string) => {
    if (!showFeedback) {
      setSelectedAnswer(option);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setIsQuizComplete(true);
      setEndTime(Date.now());
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowFeedback(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData.questions[index].correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: quizData.questions.length,
      score: correct * 2,
      maxScore: quizData.questions.length * 2,
      percentage: Math.round((correct / quizData.questions.length) * 100),
    };
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers(new Array(quizData.questions.length).fill(""));
    setIsQuizComplete(false);
    setEndTime(null);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isQuizComplete) {
    const results = calculateScore();
    const timeTaken = endTime ? endTime - startTime : 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Quiz Complete! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.score}
                </div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.percentage}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.correct}/{results.total}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(timeTaken)}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="bg-white p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Performance Feedback
              </h3>
              {results.percentage >= 80 ? (
                <div className="text-green-700">
                  <p className="font-medium">Excellent work! 🌟</p>
                  <p>
                    You have a strong understanding of AI uncertainty concepts.
                  </p>
                </div>
              ) : results.percentage >= 60 ? (
                <div className="text-blue-700">
                  <p className="font-medium">Good job! 👍</p>
                  <p>
                    You have a good grasp of the concepts. Review the
                    explanations for improvement.
                  </p>
                </div>
              ) : (
                <div className="text-orange-700">
                  <p className="font-medium">Keep learning! 📚</p>
                  <p>
                    Consider reviewing the material and taking the quiz again to
                    improve your understanding.
                  </p>
                </div>
              )}
            </div>

            {/* Question Review */}
            <div className="bg-white p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Question Review
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {quizData.questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            Q{index + 1}: {question.question}
                          </p>
                          <div className="text-sm space-y-1">
                            <p
                              className={`${
                                isCorrect ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              Your answer:{" "}
                              {
                                question.options[
                                  userAnswer as keyof typeof question.options
                                ]
                              }
                            </p>
                            {!isCorrect && (
                              <p className="text-green-600">
                                Correct answer:{" "}
                                {
                                  question.options[
                                    question.correctAnswer as keyof typeof question.options
                                  ]
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCorrect
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCorrect ? "+2" : "0"} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={restartQuiz}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {quizData.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>
                  {currentQuestionIndex + 1}/{quizData.questions.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(Date.now() - startTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>

            {/* Hint */}
            <div className="mb-6">
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="mb-3 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                💡 {showHint ? "Hide Hint" : "Show Hint"}
              </Button>

              {showHint && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Hint:</span>{" "}
                    {currentQuestion.hint}
                  </p>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = selectedAnswer === key;
                const isCorrect = key === currentQuestion.correctAnswer;
                const isWrong = showFeedback && isSelected && !isCorrect;
                const showCorrect = showFeedback && isCorrect;

                return (
                  <button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showFeedback}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      showCorrect
                        ? "border-green-500 bg-green-50 text-green-700"
                        : isWrong
                        ? "border-red-500 bg-red-50 text-red-700"
                        : isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          showCorrect
                            ? "bg-green-500 text-white"
                            : isWrong
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1">{value}</span>
                      {showFeedback && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {showFeedback && isWrong && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showFeedback && (
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                Explanation
              </h3>
              <p className="text-gray-700">{currentQuestion.explaination}</p>

              {selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">
                    ✅ Correct! You earned 2 points.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">
                    ❌ Incorrect. The correct answer is option{" "}
                    {currentQuestion.correctAnswer}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePreviousQuestion}
              variant="outline"
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {!showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center gap-2 px-8"
              >
                {isLastQuestion ? "View Results" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
