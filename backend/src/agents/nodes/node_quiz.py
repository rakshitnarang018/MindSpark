
# import modules

import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from agents.output_structures import QuizOutput
from services.supabase_service import supabase_service

# ---------------- Agent Node - Quiz ---------------
logger = logging.getLogger(__name__)


def run_node_quiz(state: AgentState):
    """LLM call to generate quiz based on summary content"""

    logger.info('node_quiz is running')

    # generate the chat prompt

    """Create a personalized prompt based on student profile"""

    prompt_template = ChatPromptTemplate([
        ("system", """ 
        You are a helpful academic tutor. Use these instructions to create a quiz on the notes provided by the user:
        
        Student Profile:
            - Class Level: {grade_level}
            - Language: {language} 
            - Gender: {gender}
        
        1. Questions should be in MCQ format with 4 options each.
        2. Create 10 quality questions which tests fundamentals and analytical thinking of the user. 
        3. Adapt your language and complexity based on the student's profile provided.
        4. Respond in JSON format which can be used to render a quiz UI.
        5. Include correct answer, hint and explaination with each question.
        """),
        ("user", "Topic Summary {topic_summary}")
    ])

    # init a new model with structured output
    model = init_chat_model(
        "gemini-2.0-flash", model_provider="google_genai").with_structured_output(QuizOutput)

    chain = prompt_template | model

    response = chain.invoke(
        {
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "English"),
            "gender": state['student_profile'].get("gender", ""),
            "topic_summary": state["summary_notes"]
        }
    )

    logger.info("Completed LLM response step")

    supabase_service.update_learning_space(state["learning_space_id"], {
                                           "quiz": response.model_dump()})

    return {"quiz": response.model_dump()}
