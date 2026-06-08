from typing import TypedDict
from agents.scout_agent import run as scout_run
from agents.comparator_agent import run as comparator_run
from agents.deal_analyst_agent import run as analyst_run


class PipelineState(TypedDict):
    query: str
    entities: dict
    raw_listings: list
    ranked_deals: list
    summary: str


def _set_status(status, progress, step):
    try:
        from routes.search_route import set_global_status
        set_global_status(status, progress, step)
    except Exception:
        pass


def _scout_node(state: PipelineState):
    _set_status("Scraping platforms...", 30, 3)
    deals = scout_run(state.get("entities", {}), state.get("query", ""))
    _set_status("Scraping complete", 40, 3)
    return {"raw_listings": deals}


def _comparator_node(state: PipelineState):
    _set_status("Retrieving history...", 50, 4)
    ranked = comparator_run(state.get("raw_listings", []), state.get("entities", {}))
    _set_status("Scoring deals...", 70, 5)
    return {"ranked_deals": ranked}


def _analyst_node(state: PipelineState):
    _set_status("Generating AI summary...", 85, 6)
    summary = analyst_run(state.get("ranked_deals", []), state.get("entities", {}))
    _set_status("Complete", 100, 6)
    return {"summary": summary}


try:
    from langgraph.graph import StateGraph, END

    def build_pipeline():
        graph = StateGraph(PipelineState)
        graph.add_node("scout", _scout_node)
        graph.add_node("comparator", _comparator_node)
        graph.add_node("analyst", _analyst_node)

        graph.set_entry_point("scout")
        graph.add_edge("scout", "comparator")
        graph.add_edge("comparator", "analyst")
        graph.add_edge("analyst", END)

        return graph.compile()

    _pipeline = build_pipeline()

    def run_pipeline(query, entities):
        _set_status("Classifying intent...", 10, 1)
        try:
            result = _pipeline.invoke({
                "query": query,
                "entities": entities,
                "raw_listings": [],
                "ranked_deals": [],
                "summary": "",
            })
            return {
                "deals": result.get("ranked_deals", []),
                "summary": result.get("summary", ""),
            }
        except Exception as e:
            print(f"LangGraph pipeline error: {e}")
            return _fallback_pipeline(query, entities, str(e))

except ImportError:
    def run_pipeline(query, entities):
        _set_status("Classifying intent...", 10, 1)
        return _fallback_pipeline(query, entities, "LangGraph not available")


def _fallback_pipeline(query, entities, error_msg=""):
    _set_status("Scraping platforms...", 30, 3)
    try:
        raw = scout_run(entities, query)
        _set_status("Retrieving history...", 50, 4)
        ranked = comparator_run(raw, entities)
        _set_status("Generating AI summary...", 85, 6)
        summary = analyst_run(ranked, entities)
        _set_status("Complete", 100, 6)
        return {"deals": ranked, "summary": summary}
    except Exception as e:
        print(f"Pipeline error: {e}")
        _set_status("Error", 0, 0)
        return {"deals": [], "summary": f"Error: {str(e)}"}
