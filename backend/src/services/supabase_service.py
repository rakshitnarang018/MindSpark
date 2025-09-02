from dotenv import load_dotenv
import os
import logging
from supabase import create_client, Client

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class SupabaseService:
    _instance = None
    _client = None
    bucket_name = 'learning-sources'

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._initialize_client()

    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")

            if not url or not key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY environment variables are required")

            self._client = create_client(url, key)
            logger.info("Supabase client initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client

    def update_learning_space(self, space_id: str, data: dict):
        """Update learning space with given data"""
        logger.info('Updating learning space')
        try:
            response = (
                self.client
                .table("learning_space")
                .update(data)
                .eq("id", space_id)
                .execute()
            )
            logger.info(f"Successfully updated learning space {space_id}")
            return response
        except Exception as e:
            logger.error(
                f"Failed to update learning space {space_id}: {str(e)}")
            raise e

    def get_student_profile(self, user_id: str):
        """get the student profile"""
        try:
            logger.info(f"Getting student profile for {user_id}")
            response = (
                self.client
                .table("student_profile")
                .select("*")
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            return response.data
        except Exception as e:
            logger.error(
                f"Failed to get student profile for {user_id}: {str(e)}")
            raise e

    def get_learning_space(self, space_id: str):
        """get the learning space data"""
        try:
            logger.info(f"Getting learning space for {space_id}")
            response = (
                self.client
                .table("learning_space")
                .select("*")
                .eq("id", space_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(
                f"Failed to get learning space for {space_id}: {str(e)}")
            raise e

    def upload_file(self, file_path: str, file_data):
        """Upload file to Supabase storage"""
        try:
            response = (
                self.client
                .storage
                .from_(self.bucket_name)
                .upload(file_path, file_data)
            )
            logger.info(
                f"Successfully uploaded file to {self.bucket_name}/{file_path}")
            return response
        except Exception as e:
            logger.error(f"Failed to upload file: {str(e)}")
            raise e

    def get_public_url(self, file_path: str):
        public_url = (
            supabase.storage
            .from_(self.bucket_name)
            .get_public_url(file_path)
        )
        return public_url


# Create a singleton instance
supabase_service = SupabaseService()

# For backward compatibility, expose the client directly
supabase = supabase_service.client
