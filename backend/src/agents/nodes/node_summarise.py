# import modules

import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from agents.output_structures import SummaryNoteOutput
from services.supabase_service import supabase_service

# -------------- Agent Node - Notes Summary ----------------

logger = logging.getLogger(__name__)


def run_node_summary_notes(state: AgentState):
    """LLM call to generate summary notes for student"""

    logger.info("node_summary_notes running....")
    logger.info(state)

    # generate the chat prompt

    # Build human message content dynamically
    user_content = [
        {"type": "text", "text": f"Topic: {state['user_prompt']['topic']}"}]

    # Add file only if it exists
    if state['user_prompt']['file_url'] and state['user_prompt']['file_url'].strip():
        user_content.append({
            "type": "file",
            "url": state['user_prompt']['file_url'],
            "source_type": "url"
        })

    prompt_template = ChatPromptTemplate([
        ("system", """You are an expert academic tutor. Create personalized educational content following these guidelines:
            
            Student Profile:
            - Class Level: {grade_level}
            - Language: {language} 
            - Gender: {gender}
            
            Content Requirements:
            1. Use the audio/image/pdf if provided by the user to genertae concise summary notes
            2. Use bullet points and simple language appropriate for {grade_level}
            3. Include practical examples and analogies
            4. Make it engaging and easy to understand
            5. Provide content in {language} only
            
            """),
        ("user", user_content)
    ])

    # init a new model with structured output
    model = init_chat_model(
        "gemini-2.0-flash", model_provider="google_genai").with_structured_output(SummaryNoteOutput)

    chain = prompt_template | model

    response = chain.invoke(
        {
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "english"),
            "gender": state['student_profile'].get("gender", ""),
        }
    )

    # update in supabase database
    # supabase_response = (
    #     supabase.table("learning_space")
    #     .update({"summary_notes": response.model_dump()})
    #     .eq("id", state["learning_space_id"])
    #     .execute()
    # )

    logger.info("Completed LLM response step")

    supabase_service.update_learning_space(state["learning_space_id"], {
                                           "summary_notes": response.model_dump()})

    return {"summary_notes": response}
