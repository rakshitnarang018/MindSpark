# ------
# This file contains the agent workflow graph created using LangGraph
# ------

from langgraph.graph import StateGraph, START, END
from agents.state import AgentState
# from .state import AgentState
from agents.nodes.node_summarise import run_node_summary_notes
from agents.nodes.node_quiz import run_node_quiz
from agents.nodes.node_mindmap import run_node_mindmap
from agents.nodes.node_recommendation import run_node_recommendation
from agents.nodes.node_audio_summary import run_node_audio_overview


class AgentGraphWorkflow:

    def __init__(self):
        self.workflow = None

        # init the graph
        self.graph = StateGraph(AgentState)

        # add nodes
        self._add_nodes()
        # add edges
        self._add_edges_()
        # compile the graph
        self._compile()

    def _add_nodes(self):
        self.graph.add_node(
            "node_summary_notes", run_node_summary_notes)
        self.graph.add_node("node_quiz", run_node_quiz)
        self.graph.add_node(
            "node_recommendations", run_node_recommendation)
        self.graph.add_node("node_mindmap", run_node_mindmap)
        self.graph.add_node(
            "node_audio_overview", run_node_audio_overview)

    def _add_edges_(self):
        self.graph.add_edge(START, "node_summary_notes")

        # parallel agents
        self.graph.add_edge("node_summary_notes", "node_quiz")
        self.graph.add_edge("node_summary_notes", "node_recommendations")
        self.graph.add_edge("node_summary_notes", "node_mindmap")
        self.graph.add_edge("node_summary_notes", "node_audio_overview")

        self.graph.add_edge("node_quiz", END)
        self.graph.add_edge("node_recommendations", END)
        self.graph.add_edge("node_mindmap", END)
        self.graph.add_edge("node_audio_overview", END)

    def _compile(self):
        self.workflow = self.graph.compile()

    def invoke(self, input_state: AgentState):
        """
        Invoke this method to execute this workflow.
        """
        final_state = self.workflow.invoke(input_state)
        return final_state
