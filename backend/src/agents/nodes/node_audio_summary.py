
# import modules

import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from agents.output_structures import PodcastContent
from services.supabase_service import supabase_service
from datetime import datetime
import re

# ----- Agent Node - Audio Summary

logger = logging.getLogger(__name__)


def run_node_audio_overview(state: AgentState):
    """LLM call to generate aduio overview based on summary content"""

    # generate the chat prompt

    logging.info('Running node_audio_overview ....')

    """Create a personalized prompt based on student profile"""

    prompt_template = ChatPromptTemplate([
        ("system", """
         You are an expert academic female tutor. Your goal is to generate engaging, informative, and personalized educational summaries for students.

            Student Profile:
            - Class Level: {grade_level}
            - Target Language: {language} (Provide content in this language.)
            - Preferred Pronouns: {gender} 

            Podcast Content Requirements:
            1.  Comprehensive Summary: Generate a detailed and well-structured summary of the user-provided topic. This summary should serve as the core script for a 7-10 minute audio podcast episode within a 3000 character limit.
            2.  Academic Appropriateness: Tailor the depth, complexity, and vocabulary of the content precisely to the specified {grade_level}. Assume the student has foundational knowledge typical for their level, but introduce new concepts clearly.
            3.  Engaging Delivery Style:
                - Write in a conversational, accessible, and enthusiastic tone.
                - Incorporate brief, relatable examples or analogies where helpful.
                - Include a brief, friendly introduction and conclusion suitable for a podcast.
            4.  Structure: Your summary should implicitly or explicitly follow a logical podcast flow:
                - Introduction: Hook the listener, introduce the topic.
                - Main Content: Break down the topic into digestible segments.
                - Key Takeaways/Recap: Briefly summarize the main points.
                - Call to Action/Further Exploration:** Encourage continued learning.
            5. Strictly use the 3000 characters limit, if the script goes beyond this, self edit it to adhere to the character limit.
                """),

        ("user",
         "Create a audio summary for the topic summary: {topic_summary}.")
    ])

    # init a new model with structured output
    model = init_chat_model(
        "gemini-2.0-flash", model_provider="google_genai", temperature=0.2).with_structured_output(PodcastContent)

    chain = prompt_template | model

    response = chain.invoke(
        {
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "English"),
            "gender": state['student_profile'].get("gender", ""),
            "topic_summary": state["summary_notes"]
        }
    )

    logger.info('Completed LLM response.')

    json_response = response.model_dump()

    # cleaning SSML

    def clean_podcast_content(content):
        clean_text = re.sub(r"[\n\r\\]", "", content)
        return clean_text

    script = clean_podcast_content(json_response['script'])

    # # # update in supabase database

    supabase_service.update_learning_space(
        state['learning_space_id'], {"audio_script": script}
    )

    return {"podcast_script": script}
