# Orchestrate the agent workflow

import logging
from services.supabase_service import supabase_service
from agents.graph import AgentGraphWorkflow

logger = logging.getLogger(__name__)


def invoke_agent_workflow(learning_space_id: str, user_id: str):
    # get the data from supabase and prepare it for calling the agent
    # run the agent in the background and return a success or failure

    # get the input data from supabase
    student_profile = supabase_service.get_student_profile(user_id)
    learning_space = supabase_service.get_learning_space(learning_space_id)

    print(student_profile)

    # prepate the initial state for agent
    initial_state = {
        "learning_space_id": learning_space_id,
        "student_profile": {
            "gender": student_profile.get('gender'),
            "grade_level": student_profile.get('grade_level'),
            "language": student_profile.get('language')
        },
        "user_prompt": {
            "topic": learning_space.get('topic'),
            "file_url": learning_space.get('pdf_source')
        }
    }

    # invoke the agent
    agent_workflow = AgentGraphWorkflow()
    response = agent_workflow.invoke(initial_state)
    return response
