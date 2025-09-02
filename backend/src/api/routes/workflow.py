from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from services.agent_workflow import invoke_agent_workflow
from services.supabase_service import supabase_service
from services.text_to_speech import generate_tts

router = APIRouter()

# Define request body model


class WorkflowRequest(BaseModel):
    learning_space_id: str
    user_id: str


@router.get("/status/{workflow_id}")
async def workflow_status(workflow_id: str):
    try:
        return {"message": "Workflow started successfully", "workflow_id": workflow_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# We can also add an auth layer to protect the api
@router.post("/invoke")
async def workflow_invoke(request: WorkflowRequest, background_tasks: BackgroundTasks):
    try:
        # invoke the workflow in background tasks
        # pass the function to be run and the arguments in the correct order
        background_tasks.add_task(
            invoke_agent_workflow, request.learning_space_id, request.user_id)
        return {"message": "Workflow started successfully.", "learning_space_id": request.learning_space_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/audio-summary")
async def audio_summary(request: WorkflowRequest):
    try:
        # get the learning space
        learning_space = supabase_service.get_learning_space(
            request.learning_space_id)
        student_profile = supabase_service.get_student_profile(request.user_id)

        if learning_space.get('audio_script'):
            # process tts
            language_code = 'hi-IN' if student_profile['language'] == 'hindi' else 'en-IN'
            tts = generate_tts(learning_space['audio_script'], language_code)

            supabase_service.update_learning_space(
                request.learning_space_id, {'audio_overview': tts['public_url']})
            return {
                'success': True,
                'audio_url': tts['public_url']
            }
        else:
            return {"message": "No audio script found.", "learning_space_id": request.learning_space_id, "success": False}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
