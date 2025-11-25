export interface Project {
  id: string;
  code: string; // Nuevo campo Código
  name: string;
  created_at?: string; // Supabase usa snake_case por defecto, lo hacemos opcional o mapeamos
  color: string;
}

export interface WorkLog {
  id: string;
  projectId: string; // En la app usamos camelCase
  project_id?: string; // Para mapear desde Supabase
  date: string; // ISO format YYYY-MM-DD
  hours: number;
  description: string;
  created_at?: string;
}

export enum Tab {
  REGISTER = 'register',
  PROJECTS = 'projects',
  REPORTS = 'reports'
}

export const COLORS = [
  '#f97316', // Orange
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#14b8a6', // Teal
];