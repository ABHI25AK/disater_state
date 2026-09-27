import rawData from '../data/seed_data.json';

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371.0; // Earth radius in kilometers
    const toRad = x => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Simple point to polygon boundary distance (minimum distance to any vertex)
// Accurate enough for hackathon demo bounding box distances.
function pointToPolygonDistance(lat, lng, polygon) {
    let minDistance = Infinity;
    for (let point of polygon) {
        // polygon is [lng, lat]
        const polyLng = point[0];
        const polyLat = point[1];
        const dist = haversine(lat, lng, polyLat, polyLng);
        if (dist < minDistance) {
            minDistance = dist;
        }
    }
    return minDistance;
}

function calculateSiteSuitability(site) {
    // Score based on land, water, services, ecological risk
    // land_available_hectares: say 20ha is 100 points
    const land = site.land_available_hectares || 0;
    const land_score = Math.min(100, (land / 20) * 100) * 0.3;
    
    const water_score = (site.water_access ? 100 : 0) * 0.2;
    
    // distance_to_hospital_km (closer is better, max 20km)
    const hosp = site.distance_to_hospital_km || 0;
    const hosp_score = Math.max(0, 100 - (hosp * 5)) * 0.25;

    // distance_to_school_km (closer is better, max 10km)
    const school = site.distance_to_school_km || 0;
    const school_score = Math.max(0, 100 - (school * 10)) * 0.25;
    
    const base_score = land_score + water_score + hosp_score + school_score;
    const penalty = site.ecological_risk_flag ? 50 : 0; // Drastic penalty
    
    const final_score = Math.max(0, Math.min(100, base_score - penalty));
    
    return {
        final_score: Number(final_score.toFixed(1)),
        breakdown: {
            land_score_contribution: Number(land_score.toFixed(1)),
            water_score_contribution: Number(water_score.toFixed(1)),
            hospital_score_contribution: Number(hosp_score.toFixed(1)),
            school_score_contribution: Number(school_score.toFixed(1)),
            ecological_penalty: penalty
        }
    };
}

function calculateHabitationPriority(habitation) {
    // Base hazard exposure is up to 100
    const hazard_exposure = habitation.current_hazard_exposure || 0;
    
    // heavily weight hazard_history_count (e.g. Wayanad has 3, which is severe)
    // 1 event = 20 pts, 3 events = 60 pts
    const history = habitation.hazard_history_count || 0;
    const history_score = Math.min(60, history * 20);
    
    // Population factor
    const pop = habitation.population || 0;
    const pop_score = Math.min(20, (pop / 2000) * 10);
    
    const raw_priority = (hazard_exposure * 0.2) + history_score + pop_score;
    const final_priority = Math.min(100, raw_priority);
    
    let tier = "Green";
    if (final_priority > 75) tier = "Red";
    else if (final_priority > 50) tier = "Yellow";
        
    return {
        priority_score: Number(final_priority.toFixed(1)),
        tier: tier,
        breakdown: {
            hazard_base: Number((hazard_exposure * 0.2).toFixed(1)),
            history_factor: Number(history_score.toFixed(1)),
            population_factor: Number(pop_score.toFixed(1))
        }
    };
}

export function getDashboardData(rainfallMultiplier = 1.0) {
    const data = JSON.parse(JSON.stringify(rawData));
    const redZones = data.red_zones || [];
    
    const sites_scored = data.candidate_sites.map(site => {
        site.suitability = calculateSiteSuitability(site);
        return site;
    });
        
    const habitations_scored = data.habitations.map(hab => {
        const original_exposure = hab.current_hazard_exposure;
        hab.current_hazard_exposure = Math.min(100, original_exposure * rainfallMultiplier);
        
        hab.priority = calculateHabitationPriority(hab);
        
        const recommendations = sites_scored.map(site => {
            const dist_km = haversine(hab.lat, hab.lng, site.lat, site.lng);
            
            // Check proximity to all red zones
            let closestRedZoneDist = Infinity;
            for (let z of redZones) {
                const d = pointToPolygonDistance(site.lat, site.lng, z.polygon);
                if (d < closestRedZoneDist) closestRedZoneDist = d;
            }

            let rejected = false;
            let rejectionReason = null;

            // Exclusion 1: Too close to a red zone (< 0.5km)
            if (closestRedZoneDist < 0.5) {
                rejected = true;
                rejectionReason = `Rejected: Too close to a Red Zone (${Math.round(closestRedZoneDist*1000)}m away)`;
            }

            // Exclusion 2: Ecological risk
            if (!rejected && site.ecological_risk_flag) {
                rejected = true;
                rejectionReason = `Rejected: High Ecological Risk (Near protected forest/wildlife)`;
            }

            // Combine distance and suitability: 50% suitability + 50% distance score
            // distance_score = 100 - min(distance_km * 2, 100)
            const dist_score = Math.max(0, 100 - Math.min(dist_km * 2, 100)); 
            let combined_match = (site.suitability.final_score * 0.5) + (dist_score * 0.5);
            if (rejected) combined_match = -1; // Push to bottom

            return {
                site_id: site.id,
                site_name: site.name,
                distance_km: Number(dist_km.toFixed(2)),
                match_score: Number(combined_match.toFixed(1)),
                suitability_breakdown: site.suitability,
                rejected,
                rejectionReason
            };
        });
            
        recommendations.sort((a, b) => b.match_score - a.match_score);
        hab.recommended_sites = recommendations.slice(0, 3);
        
        hab.simulated_hazard_exposure = Number(hab.current_hazard_exposure.toFixed(1));
        hab.current_hazard_exposure = original_exposure;
        
        return hab;
    });
        
    return {
        district: data.district,
        red_zones: redZones,
        habitations: habitations_scored,
        candidate_sites: sites_scored
    };
}
