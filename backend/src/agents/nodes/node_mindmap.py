# import modules

import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
import graphviz
from agents.state import AgentState
from agents.output_structures import MindMapStructure
from services.supabase_service import supabase_service
from datetime import datetime


#  ------- Agent Node : Mindmap -------
logger = logging.getLogger(__name__)


def create_balanced_mindmap(mindmap_data):
    """Create a more balanced mindmap layout"""

    dot = graphviz.Digraph(comment='Mindmap')

    # Set graph attributes for better layout
    dot.attr(
        rankdir='TB',  # Top to Bottom
        ranksep='1.5',  # Increase vertical separation
        nodesep='0.8',  # Increase horizontal separation
        splines='ortho',  # Use orthogonal edges
        bgcolor='white'
    )

    # Node styling
    dot.attr('node',
             shape='box',
             style='rounded,filled',
             fontname='Arial',
             fontsize='10',
             width='1.5',
             height='0.8'
             )

    nodes = mindmap_data['nodes']
    edges = mindmap_data['edges']
    central_node = mindmap_data.get('central_node', '')

    # Group nodes by their level (distance from central node)
    node_levels = {}
    for edge in edges:
        if edge['source'] == central_node:
            node_levels[edge['target']] = 1
        elif edge['source'] in node_levels:
            node_levels[edge['target']] = node_levels[edge['source']] + 1

    # Add central node
    dot.node(central_node,
             next(node['label']
                  for node in nodes if node['id'] == central_node),
             fillcolor='#FF6B6B', fontcolor='white', fontsize='12')

    # Add level 1 nodes (main concepts) in subgraphs
    level1_nodes = [node for node in nodes if node['id']
                    in node_levels and node_levels[node['id']] == 1]

    # Create subgraphs for better clustering
    for i, node in enumerate(level1_nodes):
        with dot.subgraph(name=f'cluster_{i}') as cluster:
            cluster.attr(style='invisible')  # Make cluster invisible
            cluster.node(node['id'], node['label'],
                         fillcolor='#4ECDC4', fontcolor='black')

    # Add remaining nodes
    for node in nodes:
        if node['id'] != central_node and node['id'] not in [n['id'] for n in level1_nodes]:
            dot.node(node['id'], node['label'],
                     fillcolor='#96CEB4', fontcolor='black')

    # Add edges
    for edge in edges:
        dot.edge(edge['source'], edge['target'])

    return dot


def upload_mindmap_to_supabase(dot_graph, learning_space_id: str):
    """Upload mindmap image to Supabase Storage"""

    try:
        # Generate image bytes
        image_bytes = dot_graph.pipe(format='png')

        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mindmap_{learning_space_id}_{timestamp}.png"

        # Upload to Supabase Storage
        response = supabase_service.upload_file(filename, image_bytes)

        logger.info(f"✅ Mindmap uploaded successfully: {filename}")

        public_url = supabase_service.get_public_url(filename)

        return {
            "file_path": filename,
            "public_url": public_url
        }

    except Exception as e:
        print(f"❌ Error uploading mindmap: {str(e)}")
        return None


# Agent Node - Notes Summary

def run_node_mindmap(state: AgentState):
    """LLM call to generate mindmap based on summary content"""

    logger.info('Running mindmap node...')

    # generate the chat prompt

    """Create a personalized prompt based on student profile"""

    prompt_template = ChatPromptTemplate([
        ("system", """ 
        You are a helpful academic tutor.
        Use the below context to create a json response to create a mind map using graph viz in python. The mind map should clearly explain the core concepts and key ideas.
        
        Student Profile:
            - Class Level: {grade_level}
            - Language: {language} 
            - Gender: {gender}
         
        1. Adapt your language and complexity based on the student's profile provided.
        2. Respond in JSON format which can be used to render.
        """),
        ("user", "Topic Summary {topic_summary}")
    ])

    # init a new model with structured output
    model = init_chat_model(
        "gemini-2.0-flash", model_provider="google_genai").with_structured_output(MindMapStructure)

    chain = prompt_template | model

    response = chain.invoke(
        {
            "grade_level": state['student_profile'].get("grade_level", "general"),
            "language": state['student_profile'].get("language", "English"),
            "gender": state['student_profile'].get("gender", ""),
            "topic_summary": state["summary_notes"]
        }
    )

    logger.info('LLM response completed...')

    # create mindmap graph
    json_response = response.model_dump()
    dot = create_balanced_mindmap(json_response)

    # upload to supabase storage
    upload_response = upload_mindmap_to_supabase(
        dot, state['learning_space_id'])

    # # update in supabase database
    supabase_service.update_learning_space(state['learning_space_id'], {
                                           "mindmap": upload_response["public_url"]})

    return {"mindmap": json_response}
