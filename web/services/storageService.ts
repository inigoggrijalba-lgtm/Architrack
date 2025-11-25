import { Project, WorkLog } from '../types';
import { supabase } from './supabaseClient';

// --- Helpers de Mapeo ---

const mapProjectFromDB = (p: any): Project => ({
  id: p.id,
  code: p.code,
  name: p.name,
  color: p.color,
  created_at: p.created_at
});

const mapLogFromDB = (l: any): WorkLog => ({
  id: l.id,
  projectId: l.project_id,
  date: l.date,
  hours: l.hours,
  description: l.description,
  created_at: l.created_at
});

// --- Funciones Asíncronas ---

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data.map(mapProjectFromDB);
};

export const getLogs = async (): Promise<WorkLog[]> => {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return data.map(mapLogFromDB);
};

export const saveProject = async (project: Omit<Project, 'id' | 'created_at'>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ 
      name: project.name, 
      code: project.code, 
      color: project.color 
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving project:', error);
    alert('Error al guardar: ' + error.message);
    return null;
  }
  return mapProjectFromDB(data);
};

export const updateProject = async (project: Project): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .update({ 
      name: project.name, 
      code: project.code
    })
    .eq('id', project.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    alert('Error al actualizar: ' + error.message);
    return null;
  }
  return mapProjectFromDB(data);
};

export const saveLog = async (log: Omit<WorkLog, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('work_logs')
    .insert([{
      project_id: log.projectId,
      date: log.date,
      hours: log.hours,
      description: log.description
    }]);

  if (error) {
    console.error('Error saving log:', error);
    alert('Error al registrar horas: ' + error.message);
    return false;
  }
  return true;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  // Intentamos borrar. Si falla, mostramos el error exacto.
  try {
    // 1. Intentar borrar logs explícitamente primero.
    // Ignoramos el error aquí porque si no hay logs, no pasa nada.
    // Si falla por permisos, el borrado de proyecto fallará después con el mensaje correcto.
    await supabase.from('work_logs').delete().eq('project_id', id);

    // 2. Borrar el proyecto
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error borrando proyecto:', error);
      // Mensajes específicos
      if (error.code === '23503') { // Foreign Key Constraint
        alert('Error: No se puede borrar el proyecto porque tiene registros de horas asociados y la base de datos lo impide (Foreign Key Constraint). Contacta con el administrador para habilitar "Delete Cascade".');
      } else {
        alert(`Error al borrar: ${error.message} (Código: ${error.code})`);
      }
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Excepción al borrar:', e);
    alert('Ocurrió un error inesperado al intentar borrar el proyecto.');
    return false;
  }
};

export const seedInitialData = async () => {
  // No necesario con DB
};