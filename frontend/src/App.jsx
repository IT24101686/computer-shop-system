import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden min-h-[60vh] flex flex-col md:flex-row">
        {/* Left Side (Banner) */}
        <div className="md:w-1/2 bg-blue-600 text-white p-12 flex flex-col items-start justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500 opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-blue-700 opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
              TechMart <span className="text-blue-200">Shop</span>
            </h1>
            <p className="text-lg text-blue-100 font-medium leading-relaxed">
              Your ultimate destination for premium computer hardware, accessories, and builds.
            </p>
          </div>
        </div>

        {/* Right Side (Content) */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Project Initialized!</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Frontend and Backend have been successfully connected and set up with React, Vite, Express & MongoDB.
          </p>
          
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
