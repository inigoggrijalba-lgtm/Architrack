import React, { useState, useEffect } from 'react';
import { Project, WorkLog } from '../types';
import { getProjects, saveLog } from '../services/storageService';
import { Button } from './ui/Button';
import { Clock, Calendar, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TimeLoggerProps {
  onGoToProjects: () => void;
}

export const TimeLogger: React.FC<TimeLoggerProps> = ({ onGoToProjects }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !hours || !date) return;

    setIsSubmitting(true);

    const success = await saveLog({
      projectId: selectedProject,
      date,
      hours: parseInt(hours, 10), // Asegurar que se guarda como entero
      description,
    });
    
    setIsSubmitting(false);

    if (success) {
      // Reset form
      setHours('');
      setDescription('');
      setSuccessMsg('Horas guardadas en la nube');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sin proyectos</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Necesitas crear un proyecto en la base de datos.</p>
        <Button onClick={onGoToProjects}>Crear Proyecto</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registrar Actividad</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sincronizado con Supabase</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900/30 text-sm rounded-xl flex items-center gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Select */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Proyecto</label>
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block p-3.5 pr-8 transition-all"
              >
                <option value="" disabled>Seleccionar proyecto...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block w-full pl-11 p-3.5 transition-all"
                />
              </div>
            </div>

            {/* Hours Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nº de Horas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block w-full pl-11 p-3.5 transition-all"
                />
              </div>
            </div>
          </div>

           {/* Description Input (Optional) */}
           <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Notas <span className="text-slate-400 font-normal text-xs">(Opcional)</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles de la tarea..."
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block w-full pl-11 p-3.5 resize-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth className="dark:shadow-none" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};