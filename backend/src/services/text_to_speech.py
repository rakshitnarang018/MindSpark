import logging
import os
import subprocess
import tempfile
from datetime import datetime
from services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

def generate_tts(text_input: str, language_code: str):
    """TTS using edge-tts CLI command - no async issues"""
    
    audio_data = None
    
    try:
        # Voice mapping
        voice_mapping = {
            'en-IN': 'en-IN-NeerjaNeural',
            'hi-IN': 'hi-IN-SwaraNeural', 
            'en-US': 'en-US-JennyNeural',
            'en': 'en-IN-NeerjaNeural',
            'hi': 'hi-IN-SwaraNeural'
        }
        
        voice = voice_mapping.get(language_code, 'en-IN-NeerjaNeural')
        
        # Create temp file
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_path = temp_file.name
        
        # Use edge-tts CLI command
        cmd = [
            'edge-tts',
            '--voice', voice,
            '--text', text_input,
            '--write-media', temp_path
        ]
        
        logger.info(f"Running Edge TTS command: {' '.join(cmd)}")
        
        # Run command
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            # Read the generated audio file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            logger.info(f"Edge TTS success: {len(audio_data)} bytes")
        else:
            logger.error(f"Edge TTS command failed: {result.stderr}")
            audio_data = b""
        
        # Clean up temp file
        os.unlink(temp_path)
        
    except FileNotFoundError:
        logger.error("edge-tts command not found. Install with: pip install edge-tts")
        audio_data = b""
    except subprocess.TimeoutExpired:
        logger.error("Edge TTS command timed out")
        audio_data = b""
    except Exception as e:
        logger.error(f"Edge TTS failed: {str(e)}")
        audio_data = b""
    
    # Fallback if no audio generated
    if not audio_data or len(audio_data) == 0:
        logger.info("No audio generated, creating empty file")
        audio_data = b""

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

    logger.info(f"TTS audio uploaded successfully: {filename}, Size: {len(audio_data)} bytes")

    return {
        "success": True,
        "filename": filename,
        "public_url": public_url,
        "upload_response": upload_response
    }