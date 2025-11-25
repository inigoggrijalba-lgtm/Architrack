import React, { useState, useEffect, useMemo } from 'react';
import { Project, WorkLog } from '../types';
import { getProjects, getLogs } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Filter, CalendarRange, Clock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const ReportView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState<string>('all');
  
  // "Desde" vacío por defecto (histórico completo)
  const [startDate, setStartDate] = useState<string>('');
  // "Hasta" hoy por defecto
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [pData, lData] = await Promise.all([getProjects(), getLogs()]);
      setProjects(pData);
      setLogs(lData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return logs.filter(log => {
      // Si startDate está vacío, es válido (desde el principio de los tiempos)
      const isAfterStart = !startDate || log.date >= startDate;
      // Si endDate está vacío (raro por el default, pero posible), es válido
      const isBeforeEnd = !endDate || log.date <= endDate;
      
      const isProjectValid = filterProject === 'all' || log.projectId === filterProject;

      return isAfterStart && isBeforeEnd && isProjectValid;
    });
  }, [logs, filterProject, startDate, endDate]);

  const totalHours = filteredData.reduce((acc, curr) => acc + curr.hours, 0);

  const chartData = useMemo(() => {
    if (filterProject === 'all') {
      // Agrupar por Proyecto para comparar
      const grouped: Record<string, { name: string, hours: number, color: string }> = {};
      projects.forEach(p => {
        // Usamos el NOMBRE (p.name) en lugar del código para Eje X y Tooltip
        grouped[p.id] = { name: p.name, hours: 0, color: p.color };
      });
      
      filteredData.forEach(log => {
        if (grouped[log.projectId]) {
          grouped[log.projectId].hours += log.hours;
        }
      });

      return Object.values(grouped).filter(item => item.hours > 0);
    } else {
      // Agrupar por Día para ver evolución
      const currentProject = projects.find(p => p.id === filterProject);
      const projectColor = currentProject ? currentProject.color : '#f97316'; // Fallback orange-500

      const grouped: Record<string, { name: string, hours: number, color: string }> = {};
      
      filteredData.forEach(log => {
        const dateKey = format(parseISO(log.date), 'dd/MM', { locale: es });
        if (!grouped[dateKey]) {
          grouped[dateKey] = { name: dateKey, hours: 0, color: projectColor };
        }
        grouped[dateKey].hours += log.hours;
      });
      return Object.values(grouped);
    }
  }, [filteredData, filterProject, projects]);

  const getProjectName = (id: string) => {
    const p = projects.find(p => p.id === id);
    return p ? `[${p.code}] ${p.name}` : 'Desconocido';
  };

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reportes</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Analiza el rendimiento por proyecto</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 transition-colors">
        <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300 font-medium">
          <Filter className="w-5 h-5 text-orange-500" />
          <span>Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Proyecto</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="all">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 dark:bg-orange-600 text-white p-5 rounded-2xl shadow-lg shadow-slate-900/20 dark:shadow-orange-900/30 transition-colors">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Horas</span>
          </div>
          <div className="text-3xl font-bold">{totalHours.toFixed(1)} <span className="text-lg font-normal opacity-70">h</span></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <CalendarRange className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Registros</span>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">{filteredData.length}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 min-h-[300px] transition-colors">
         <h3 className="font-semibold text-slate-800 dark:text-white mb-6">
           {filterProject === 'all' ? 'Horas por Proyecto' : 'Evolución por Día'}
         </h3>
         <div className="h-64 w-full">
           {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-text, #1e293b)'}}
                    itemStyle={{ color: '#64748b' }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#f97316'} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
               Sin datos para este periodo
             </div>
           )}
         </div>
      </div>

      {/* Recent Logs List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Detalle de Registros</h3>
        {filteredData.length === 0 ? (
           <p className="text-center text-slate-400 dark:text-slate-600 py-6 text-sm">No hay registros que coincidan con los filtros.</p>
        ) : (
          filteredData
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(log => (
            <div key={log.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="overflow-hidden mr-4">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{getProjectName(log.projectId)}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs flex gap-2 items-center mt-0.5">
                  <span className="whitespace-nowrap">{format(parseISO(log.date), 'dd MMM', { locale: es })}</span>
                  {log.description && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="truncate">{log.description}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                {log.hours} h
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};