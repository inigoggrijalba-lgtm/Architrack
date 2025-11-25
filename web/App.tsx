import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import { seedInitialData } from './services/storageService';
import { TimeLogger } from './components/TimeLogger';
import { ProjectManager } from './components/ProjectManager';
import { ReportView } from './components/ReportView';
import { LayoutDashboard, PlusCircle, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.REGISTER);

  useEffect(() => {
    seedInitialData();
    // Forzamos la clase dark en el HTML por si acaso
    document.documentElement.classList.add('dark');
  }, []);

  const renderContent = () => {
    switch (currentTab) {
      case Tab.REGISTER:
        return <TimeLogger onGoToProjects={() => setCurrentTab(Tab.PROJECTS)} />;
      case Tab.PROJECTS:
        return <ProjectManager />;
      case Tab.REPORTS:
        return <ReportView />;
      default:
        return <TimeLogger onGoToProjects={() => setCurrentTab(Tab.PROJECTS)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-600 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">ArchiTrack</h1>
              <p className="text-[10px] font-medium text-slate-400 leading-none mt-1">Control de horas</p>
            </div>
          </div>
          {/* Theme toggle removed for Dark Mode only */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto pb-24 pt-2">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50 pb-safe-area z-30">
        <div className="max-w-md mx-auto flex justify-around items-center h-[70px]">
          <button
            onClick={() => setCurrentTab(Tab.REGISTER)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1.5 group focus:outline-none"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${currentTab === Tab.REGISTER ? 'bg-orange-500/20 text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              <PlusCircle className={`w-6 h-6 ${currentTab === Tab.REGISTER ? 'fill-current' : ''}`} strokeWidth={currentTab === Tab.REGISTER ? 2 : 1.5} />
            </div>
            <span className={`text-[10px] font-medium transition-colors ${currentTab === Tab.REGISTER ? 'text-orange-400' : 'text-slate-500'}`}>Registrar</span>
          </button>

          <button
            onClick={() => setCurrentTab(Tab.PROJECTS)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1.5 group focus:outline-none"
          >
             <div className={`p-1.5 rounded-xl transition-all duration-300 ${currentTab === Tab.PROJECTS ? 'bg-orange-500/20 text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              <LayoutDashboard className={`w-6 h-6 ${currentTab === Tab.PROJECTS ? 'fill-current' : ''}`} strokeWidth={currentTab === Tab.PROJECTS ? 2 : 1.5} />
            </div>
            <span className={`text-[10px] font-medium transition-colors ${currentTab === Tab.PROJECTS ? 'text-orange-400' : 'text-slate-500'}`}>Proyectos</span>
          </button>

          <button
            onClick={() => setCurrentTab(Tab.REPORTS)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1.5 group focus:outline-none"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${currentTab === Tab.REPORTS ? 'bg-orange-500/20 text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              <PieChart className={`w-6 h-6 ${currentTab === Tab.REPORTS ? 'fill-current' : ''}`} strokeWidth={currentTab === Tab.REPORTS ? 2 : 1.5} />
            </div>
            <span className={`text-[10px] font-medium transition-colors ${currentTab === Tab.REPORTS ? 'text-orange-400' : 'text-slate-500'}`}>Reportes</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;