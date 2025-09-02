import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from agents.output_structures import MindMapStructure
from services.supabase_service import supabase_service
from datetime import datetime
import json
import base64

logger = logging.getLogger(__name__)

def create_html_mindmap(mindmap_data):
    """Create an HTML/SVG mindmap instead of using Graphviz"""
    
    nodes = mindmap_data['nodes']
    edges = mindmap_data['edges']
    central_node = mindmap_data.get('central_node', '')
    
    # Generate HTML with embedded SVG
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mindmap</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .mindmap-container {{
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 80vh;
            }}
            .mindmap {{
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 800px;
                width: 100%;
            }}
            .central-node {{
                text-align: center;
                background: #FF6B6B;
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 30px;
                display: inline-block;
            }}
            .level-1-container {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }}
            .level-1-node {{
                background: #4ECDC4;
                color: black;
                padding: 12px 20px;
                border-radius: 15px;
                text-align: center;
                font-weight: bold;
                position: relative;
            }}
            .level-2-nodes {{
                margin-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }}
            .level-2-node {{
                background: #96CEB4;
                color: black;
                padding: 8px 15px;
                border-radius: 12px;
                font-size: 14px;
            }}
            .connection-line {{
                width: 2px;
                height: 20px;
                background: #ddd;
                margin: 0 auto;
            }}
        </style>
    </head>
    <body>
        <div class="mindmap-container">
            <div class="mindmap">
    """
    
    # Find central node
    central_node_label = ""
    for node in nodes:
        if node['id'] == central_node:
            central_node_label = node['label']
            break
    
    html_content += f'<div class="central-node">{central_node_label}</div>'
    html_content += '<div class="connection-line"></div>'
    
    # Group nodes by level
    level_1_nodes = []
    level_2_nodes = {}
    
    for edge in edges:
        if edge['source'] == central_node:
            # Find the target node
            for node in nodes:
                if node['id'] == edge['target']:
                    level_1_nodes.append(node)
                    level_2_nodes[node['id']] = []
                    break
    
    # Find level 2 nodes
    for edge in edges:
        if edge['source'] in [n['id'] for n in level_1_nodes]:
            for node in nodes:
                if node['id'] == edge['target']:
                    level_2_nodes[edge['source']].append(node)
                    break
    
    # Generate level 1 nodes with their children
    html_content += '<div class="level-1-container">'
    
    for node in level_1_nodes:
        html_content += f'<div class="level-1-branch">'
        html_content += f'<div class="level-1-node">{node["label"]}</div>'
        
        if level_2_nodes.get(node['id']):
            html_content += '<div class="level-2-nodes">'
            for child_node in level_2_nodes[node['id']]:
                html_content += f'<div class="level-2-node">{child_node["label"]}</div>'
            html_content += '</div>'
        
        html_content += '</div>'
    
    html_content += '</div>'
    html_content += """
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content

def upload_mindmap_to_supabase(html_content, learning_space_id: str):
    """Upload mindmap HTML to Supabase Storage"""
    
    try:
        # Convert HTML to bytes
        html_bytes = html_content.encode('utf-8')
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mindmap_{learning_space_id}_{timestamp}.html"
        
        # Upload to Supabase Storage
        response = supabase_service.upload_file(filename, html_bytes)
        
        if response:
            logger.info(f"✅ Mindmap uploaded successfully: {filename}")
            
            public_url = supabase_service.get_public_url(filename)
            
            return {
                "file_path": filename,
                "public_url": public_url
            }
        else:
            logger.error("Failed to upload mindmap")
            return None
            
    except Exception as e:
        logger.error(f"❌ Error uploading mindmap: {str(e)}")
        return None

def run_node_mindmap(state: AgentState):
    """LLM call to generate mindmap based on summary content"""
    
    logger.info('Running mindmap node...')
    
    try:
        # Generate the chat prompt
        prompt_template = ChatPromptTemplate([
            ("system", """ 
            You are a helpful academic tutor.
            Use the below context to create a json response to create a mind map. The mind map should clearly explain the core concepts and key ideas.
            
            Student Profile:
                - Class Level: {grade_level}
                - Language: {language} 
                - Gender: {gender}
             
            1. Adapt your language and complexity based on the student's profile provided.
            2. Respond in JSON format which can be used to render.
            3. Create a hierarchical structure with a central topic and branching concepts.
            """),
            ("user", "Topic Summary: {topic_summary}")
        ])
        
        # Init a new model with structured output
        model = init_chat_model(
            "gemini-2.0-flash", model_provider="google_genai").with_structured_output(MindMapStructure)
        
        chain = prompt_template | model
        
        response = chain.invoke({
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "English"),
            "gender": state['student_profile'].get("gender", ""),
            "topic_summary": state.get("summary_notes", "No summary available")
        })
        
        logger.info('LLM response completed...')
        
        # Create mindmap HTML
        json_response = response.model_dump()
        html_mindmap = create_html_mindmap(json_response)
        
        # Upload to supabase storage
        upload_response = upload_mindmap_to_supabase(html_mindmap, state['learning_space_id'])
        
        if upload_response:
            # Update in supabase database
            supabase_service.update_learning_space(state['learning_space_id'], {
                "mindmap": upload_response["public_url"]
            })
            
            logger.info(f"Mindmap updated in database: {upload_response['public_url']}")
            
            return {"mindmap": json_response}
        else:
            logger.error("Failed to upload mindmap, skipping database update")
            return {"mindmap": json_response}
            
    except Exception as e:
        logger.error(f"Error in mindmap generation: {str(e)}")
        # Return empty mindmap data to continue workflow
        return {"mindmap": {"nodes": [], "edges": [], "central_node": ""}}