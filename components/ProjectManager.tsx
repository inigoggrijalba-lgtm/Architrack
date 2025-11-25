import React, { useState, useEffect } from 'react';
import { Project, COLORS } from '../types';
import { getProjects, saveProject, deleteProject, updateProject } from '../services/storageService';
import { Button } from './ui/Button';
import { Plus, Trash2, Briefcase, X, Loader2, Hash, Pencil, AlertTriangle } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para el Modal de Confirmación
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await getProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setNewProjectName('');
    setNewProjectCode('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); 
    setNewProjectName(project.name);
    setNewProjectCode(project.code);
    setEditingId(project.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectCode.trim()) return;

    setIsSaving(true);

    try {
      if (editingId) {
        const projectToUpdate = projects.find(p => p.id === editingId);
        if (projectToUpdate) {
           const updated = await updateProject({
             ...projectToUpdate,
             name: newProjectName.trim(),
             code: newProjectCode.trim().toUpperCase()
           });
           
           if (updated) {
             await loadProjects();
             resetForm();
           }
        }
      } else {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const result = await saveProject({
          name: newProjectName.trim(),
          code: newProjectCode.trim().toUpperCase(),
          color: color
        });

        if (result) {
          await loadProjects();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar el proyecto.");
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Abre el modal en lugar de usar window.confirm
  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  // 2. Ejecuta el borrado real cuando se confirma en el modal
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteProject(projectToDelete.id);
      if (success) {
        await loadProjects();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null); // Cerrar modal
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 animate-fade-in relative">
      
      {/* Modal de Confirmación Personalizado */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xs border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Eliminar Proyecto?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Vas a eliminar <strong>{projectToDelete.name}</strong> ({projectToDelete.code}).
                <br/>
                Esta acción borrará también todas sus horas registradas y no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => setProjectToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="danger" 
                  fullWidth 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Proyectos</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gestión de proyectos</p>
        </div>
        {!isAdding && (
          <Button onClick={() => { resetForm(); setIsAdding(true); }} className="!px-3 !py-2 !rounded-full bg-orange-600 hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-500">
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-black/30 mb-6 animate-slide-down relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <div className="flex justify-between items-start mb-3">
             <h3 className="font-semibold text-slate-800 dark:text-white">
               {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
             </h3>
             <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
             </button>
          </div>
          
          <form onSubmit={handleAddOrUpdateProject} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="w-1/3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="CÓD"
                  value={newProjectCode}
                  onChange={(e) => setNewProjectCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block pl-9 p-3 transition-all uppercase font-mono"
                />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Nombre del proyecto..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 block p-3 transition-all"
              />
            </div>
            <Button type="submit" disabled={!newProjectName.trim() || !newProjectCode.trim() || isSaving} fullWidth className="bg-orange-600 hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-500">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Actualizar' : 'Guardar Proyecto')}
            </Button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="bg-slate-200 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No hay proyectos</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Añade uno para comenzar</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:shadow-md dark:hover:shadow-black/30 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex flex-col flex-1 min-w-0 pl-2">
                 {/* 1. NOMBRE DEL PROYECTO: Grande, Arriba y Destacado */}
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-0.5">
                  {project.name}
                </h3>

                {/* 2. CÓDIGO DEL PROYECTO: Pequeño, Abajo y coloreado */}
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400 font-mono tracking-wide truncate pr-2">
                  {project.code}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={(e) => handleStartEdit(e, project)}
                  className="p-2.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors cursor-pointer focus:outline-none z-10"
                  title="Editar"
                >
                  <Pencil className="w-5 h-5 pointer-events-none" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleDeleteClick(e, project)}
                  className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer focus:outline-none z-10"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5 pointer-events-none" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};