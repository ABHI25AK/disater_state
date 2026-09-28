import { useState, useEffect } from 'react';
import MapDashboard from './components/MapDashboard';
import PriorityDashboard from './components/PriorityDashboard';
import { getDashboardData } from './services/scoring';

function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'table'
  const [rainfallMultiplier, setRainfallMultiplier] = useState(1.0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchData();
  }, [rainfallMultiplier]);

  const fetchData = async () => {
    try {
      const computedData = getDashboardData(rainfallMultiplier);
      setData(computedData);
    } catch (err) {
      console.error("Error computing data:", err);
    }
  };

  if (!data) return <div className="flex h-screen items-center justify-center font-sans text-gray-500">Loading system data...</div>;

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-xl max-w-lg w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">AI-driven Red Zone & Relocation Decision Support — {data.district}</h1>
          <p className="text-gray-500 mb-8 text-sm">Smart India Hackathon Prototype (PS 26191) - NDRF/MHA Theme</p>
          
          <button 
            onClick={() => setIsAuthenticated(true)}
            className="w-full py-3 px-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-md transition-colors text-lg flex justify-center items-center gap-2"
          >
            Login as SDMA Official
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-red-800 text-white p-4 shadow-md flex justify-between items-center z-20">
        <div>
          <h1 className="text-xl font-bold">Red Zone Relocation DSS — {data.district}</h1>
          <p className="text-sm text-red-200">SDMA Official Portal | Smart India Hackathon Prototype</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-red-900 px-3 py-1 rounded text-xs mr-4 border border-red-700 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Live Data
          </div>
          <button 
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${activeTab === 'map' ? 'bg-red-600 shadow-inner' : 'bg-red-900/50 hover:bg-red-700'}`}
            onClick={() => setActiveTab('map')}
          >
            Map Dashboard
          </button>
          <button 
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${activeTab === 'table' ? 'bg-red-600 shadow-inner' : 'bg-red-900/50 hover:bg-red-700'}`}
            onClick={() => setActiveTab('table')}
          >
            Priority Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        {activeTab === 'map' ? (
          <MapDashboard 
            data={data} 
            rainfallMultiplier={rainfallMultiplier}
            setRainfallMultiplier={setRainfallMultiplier}
          />
        ) : (
          <PriorityDashboard data={data} />
        )}
      </main>
    </div>
  );
}

export default App;
