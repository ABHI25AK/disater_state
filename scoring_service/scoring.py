import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_site_suitability(site):
    """
    Suitability score (0-100)
    Weighted combination:
    - land_availability (30%)
    - water_access (30%)
    - distance_to_services (inverse, closer is better) (40%)
    - ecological_risk_flag (penalty of 50 points if True)
    """
    land_score = site.get("land_availability", 0) * 0.3
    water_score = site.get("water_access", 0) * 0.3
    
    # distance_to_services is distance in some unit or an abstract score. 
    # Let's say distance is in km, closer is better. 0 km = 100 score, 50km = 0 score
    dist = site.get("distance_to_services", 0)
    dist_score_raw = max(0, 100 - (dist * 2)) 
    dist_score = dist_score_raw * 0.4
    
    base_score = land_score + water_score + dist_score
    
    penalty = 50 if site.get("ecological_risk_flag", False) else 0
    final_score = max(0, min(100, base_score - penalty))
    
    return {
        "final_score": round(final_score, 1),
        "breakdown": {
            "land_score_contribution": round(land_score, 1),
            "water_score_contribution": round(water_score, 1),
            "services_score_contribution": round(dist_score, 1),
            "ecological_penalty": penalty
        }
    }

def calculate_habitation_priority(habitation):
    """
    Priority/urgency rank (0-100)
    Combination of hazard severity + population vulnerability.
    """
    # Base hazard exposure is up to 100
    hazard_exposure = habitation.get("current_hazard_exposure", 0)
    
    # Historical frequency adds up to 20 points
    history_score = min(20, habitation.get("hazard_history", 0) * 10)
    
    # Population vulnerability: higher population in hazard zone increases priority
    # Let's assume > 1000 people adds 20 points, etc.
    pop = habitation.get("population", 0)
    pop_score = min(30, (pop / 1000) * 10)
    
    raw_priority = (hazard_exposure * 0.5) + history_score + pop_score
    final_priority = min(100, raw_priority)
    
    tier = "Green"
    if final_priority > 75:
        tier = "Red"
    elif final_priority > 50:
        tier = "Yellow"
        
    return {
        "priority_score": round(final_priority, 1),
        "tier": tier,
        "breakdown": {
            "hazard_base": round(hazard_exposure * 0.5, 1),
            "history_factor": round(history_score, 1),
            "population_factor": round(pop_score, 1)
        }
    }
