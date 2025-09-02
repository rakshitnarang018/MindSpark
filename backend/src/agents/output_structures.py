# -----
# This file contains all the output structures for different agents
# -----

from pydantic import BaseModel, Field
from typing import List, Optional


# ------- Summary Note Output Structure --------
class SummaryNoteOutput(BaseModel):
    title: str = Field(description="Title of the note")
    summary: str = Field(description="Summary Note in markdown language")


# ------- Quiz Output Structure --------
class QuestionOptions(BaseModel):
    A: str = Field("Option A for the question")
    B: str = Field("Option B for the question")
    C: str = Field("Option C for the question")
    D: str = Field("Option D for the question")


class Question(BaseModel):
    question: str = Field(
        description="Question")
    options: QuestionOptions
    correctAnswer: str = Field(
        description="Correct answer - one of these options A, B, C or D")
    hint: str = Field(
        description="A small hint to help user think in right direction")
    explaination: str = Field(description="Explaination of the correct answer")


class QuizOutput(BaseModel):
    title: str = Field(description="A suitable title for the quiz.")
    questions: List[Question] = Field(
        description="A list of quiz questions in MCQ format, with each question having 4 options."
    )


# ---- Recommendation Output Structure -------

class Recommendation(BaseModel):
    title: str = Field(description="A title for this recommendation.")
    description: str = Field(description="A brief description.")
    url: str = Field(
        description="source URL of this recommendation if available else NULL.")


class RecommendationList(BaseModel):
    recommendations: List[Recommendation] = Field(
        description="List of recommendations")


# ---- Podcast Output Structure -------

class PodcastContent(BaseModel):
    topic: str = Field(description="topic of the podcast")
    # SSML: str = Field(description="SSML content for the podcast")
    script: str = Field(description="Script for the audio summary")

# ---- Mindmap Output Structure -------


class Node(BaseModel):
    id: str
    label: str
    fillcolor: Optional[str] = "white"


class Edge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class MindMapStructure(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    central_node: str
