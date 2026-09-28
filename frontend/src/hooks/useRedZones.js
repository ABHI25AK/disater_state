import { useMemo } from 'react';
import { useHazardContext } from '../context/HazardContext';
import hazardZonesGeoJSON from '../data/hazardZones.json';
// Actually, JSON imports work fine in Vite.

export function useRedZones() {
  const { sliders } = useHazardContext();

  const redZonesData = useMemo(() => {
    // Compute a mock multiplier based on sliders. 50 is base (1.0).
    const avgScore = (sliders.rainfall + sliders.slope + sliders.soil + sliders.history) / 4;
    const multiplier = avgScore / 50; // 0.0 to 2.0

    // Dynamic opacity
    const opacity = Math.min(0.9, Math.max(0.2, 0.5 * multiplier));

    // Dynamic count (if multiplier < 0.5, maybe some zones "deactivate")
    const activeCount = multiplier > 0.6 ? hazardZonesGeoJSON.features.length : 1;
    
    const activeFeatures = hazardZonesGeoJSON.features.slice(0, activeCount);

    return {
      features: activeFeatures,
      opacity: opacity,
      activeCount: activeCount,
      accuracy: Math.min(99, Math.max(70, 94 + (multiplier - 1) * 5)).toFixed(1)
    };
  }, [sliders]);

  return redZonesData;
}
