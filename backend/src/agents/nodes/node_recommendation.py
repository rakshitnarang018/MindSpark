# import modules

import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from agents.output_structures import RecommendationList
from services.supabase_service import supabase_service

# ----- Agent Node : Recommendation ----

logger = logging.getLogger(__name__)


def run_node_recommendation(state: AgentState):
    """LLM call to generate recommendation based on summary content"""

    logger.info("node_recommendation running....")

    # generate the chat prompt

    """Create a personalized prompt based on student profile"""

    prompt_template = ChatPromptTemplate([
        ("system", """ 
        You are a helpful academic tutor. Use these instructions to create a recommendation list based on the notes provided by the user:
        
        Student Profile:
            - Class Level: {grade_level}
            - Language: {language} 
            - Gender: {gender}
        
        1. The recommendation should include all the necessary resources to learn the topic.
        2. Create uptp 10 quality recommendations with a mixture of books, online lectures, articles etc. 
        3. Adapt your language and complexity based on the student's profile provided and add proper contextual description and url if available with each source.
        4. Respond in JSON format which can be used to render a UI.
        """),
        ("user", "Topic Summary {topic_summary}")
    ])

    # init a new model with structured output
    model = init_chat_model(
        "gemini-2.0-flash", model_provider="google_genai").with_structured_output(RecommendationList)

    chain = prompt_template | model

    response = chain.invoke(
        {
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "English"),
            "gender": state['student_profile'].get("gender", ""),
            "topic_summary": state["summary_notes"]
        }
    )

    logger.info('LLM response completed.')

    # update in supabase database

    supabase_service.update_learning_space(state['learning_space_id'], {
        "recommendations": response.model_dump()
    })

    return {"recommendations": response.model_dump()}
