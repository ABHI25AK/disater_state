import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scoring import calculate_site_suitability, calculate_habitation_priority, haversine

app = FastAPI(title="Red Zone DSS Scoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seed_data.json")

def load_data():
    with open(DATA_PATH, 'r') as f:
        return json.load(f)

@app.get("/api/data")
def get_dashboard_data(rainfall_multiplier: float = 1.0):
    data = load_data()
    
    # Process Candidate Sites
    sites_scored = []
    for site in data.get("candidate_sites", []):
        scoring_result = calculate_site_suitability(site)
        site["suitability"] = scoring_result
        sites_scored.append(site)
        
    # Process Habitations
    habitations_scored = []
    for hab in data.get("habitations", []):
        # Scenario simulation: scale hazard exposure
        original_exposure = hab["current_hazard_exposure"]
        hab["current_hazard_exposure"] = min(100, original_exposure * rainfall_multiplier)
        
        priority_result = calculate_habitation_priority(hab)
        hab["priority"] = priority_result
        
        # Recommend top 2-3 sites based on distance and suitability
        # Sort sites by a combined metric: 60% suitability, 40% distance (closer is better)
        recommendations = []
        for site in sites_scored:
            dist_km = haversine(hab["lat"], hab["lng"], site["lat"], site["lng"])
            dist_score = max(0, 100 - (dist_km * 5)) # 20km = 0 score
            
            combined_match = (site["suitability"]["final_score"] * 0.6) + (dist_score * 0.4)
            recommendations.append({
                "site_id": site["id"],
                "site_name": site["name"],
                "distance_km": round(dist_km, 2),
                "match_score": round(combined_match, 1),
                "suitability_breakdown": site["suitability"]
            })
            
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        hab["recommended_sites"] = recommendations[:3]
        
        # restore original for clean output if we want, but we can just leave it as simulated
        hab["simulated_hazard_exposure"] = round(hab["current_hazard_exposure"], 1)
        hab["current_hazard_exposure"] = original_exposure
        
        habitations_scored.append(hab)
        
    return {
        "district": data.get("district"),
        "red_zones": data.get("red_zones", []),
        "habitations": habitations_scored,
        "candidate_sites": sites_scored
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
