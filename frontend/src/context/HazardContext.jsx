import React, { createContext, useState, useContext } from 'react';

const HazardContext = createContext();

export const useHazardContext = () => useContext(HazardContext);

export const HazardProvider = ({ children }) => {
  const defaultSliders = {
    rainfall: 50,
    slope: 50,
    soil: 50,
    history: 50
  };

  const [sliders, setSliders] = useState(defaultSliders);

  const resetSliders = () => setSliders(defaultSliders);

  return (
    <HazardContext.Provider value={{ sliders, setSliders, resetSliders }}>
      {children}
    </HazardContext.Provider>
  );
};
