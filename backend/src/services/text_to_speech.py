import logging
import os
from datetime import datetime
from services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

# Only initialize AWS Polly if keys exist
USE_AWS = os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")

if USE_AWS:
    import boto3
    polly = boto3.client(
        'polly',
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION", "us-east-1")
    )
else:
    polly = None
    logger.info("AWS Polly not initialized. Using offline/skip mode.")


def generate_tts(text_input: str, language_code: str):
    if USE_AWS and polly:
        try:
            response = polly.synthesize_speech(
                Engine='neural',
                Text=text_input,
                LanguageCode=language_code,  # 'hi-IN' or 'en-IN'
                OutputFormat='mp3',
                VoiceId='Kajal'
            )

            audio_data = response['AudioStream'].read()

        except Exception as e:
            logger.error(f"Error generating TTS: {str(e)}")
            raise e

    else:
        # Fallback: offline TTS or skip
        logger.info("Skipping AWS Polly. Returning dummy audio data.")
        audio_data = b""  # Empty bytes or generate using pyttsx3 if you want

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"audio_{timestamp}.mp3"

    # Upload to Supabase storage
    upload_response = supabase_service.upload_file(
        file_path=filename,
        file_data=audio_data
    )

    # Get public URL
    public_url = supabase_service.get_public_url(filename)

    logger.info(f"TTS audio uploaded successfully: {filename}")

    return {
        "success": True,
        "filename": filename,
        "public_url": public_url,
        "upload_response": upload_response
    }
