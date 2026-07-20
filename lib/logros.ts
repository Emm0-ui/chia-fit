import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type Logro = {
  id: string;
  titulo: string;
  descripcion: string;
  emoji: string;
  color: string;
  completado: boolean;
  fecha?: string;
};

const LOGROS_KEY = 'chiafit_logros';

export const LOGROS_DEFINICION: Omit<Logro, 'completado' | 'fecha'>[] = [
  { id: 'primer_escaneo', titulo: 'Primer análisis', descripcion: 'Escaneaste tu primer alimento con ChIA Fit', emoji: '🔍', color: '#16A34A' },
  { id: 'primer_plan', titulo: 'Plan en marcha', descripcion: 'Generaste tu primer plan nutricional personalizado', emoji: '📋', color: '#3B82F6' },
  { id: 'primera_semana', titulo: 'Primera semana', descripcion: 'Registraste tu peso durante 7 días', emoji: '🌱', color: '#16A34A' },
  { id: 'racha_7', titulo: 'Racha de 7 días', descripcion: 'Completaste ejercicio 7 días seguidos', emoji: '🔥', color: '#F97316' },
  { id: 'racha_30', titulo: 'Mes completo', descripcion: 'Completaste ejercicio 30 días seguidos', emoji: '⚡', color: '#FACC15' },
  { id: 'hidratacion_perfecta', titulo: 'Hidratación perfecta', descripcion: 'Alcanzaste tu meta de agua 7 días seguidos', emoji: '💧', color: '#3B82F6' },
  { id: 'tres_escaneres', titulo: 'Explorador', descripcion: 'Usaste los 3 tipos de escáneres', emoji: '🗺️', color: '#A855F7' },
  { id: 'madurez_expert', titulo: 'Experto en frescura', descripcion: 'Analizaste 10 frutas o verduras', emoji: '🥑', color: '#16A34A' },
  { id: 'primer_mes', titulo: 'Un mes contigo', descripcion: 'Llevas 30 días usando ChIA Fit', emoji: '🌿', color: '#16A34A' },
  { id: 'consulta_antojo', titulo: 'Sin culpas', descripcion: 'Usaste la función Consulta tu antojo', emoji: '🧘', color: '#F97316' },
];

export async function cargarLogros(): Promise<Logro[]> {
  const saved = await AsyncStorage.getItem(LOGROS_KEY);
  const completados: Record<string, string> = saved ? JSON.parse(saved) : {};
  return LOGROS_DEFINICION.map(l => ({ ...l, completado: !!completados[l.id], fecha: completados[l.id] }));
}

export async function desbloquearLogro(id: string): Promise<boolean> {
  const saved = await AsyncStorage.getItem(LOGROS_KEY);
  const completados: Record<string, string> = saved ? JSON.parse(saved) : {};
  if (completados[id]) return false;
  completados[id] = new Date().toISOString().split('T')[0];
  await AsyncStorage.setItem(LOGROS_KEY, JSON.stringify(completados));
  return true;
}

export async function verificarYDesbloquearLogros() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const [{ data: scans }, { data: progress }, { data: ejercicio }, { data: profile }] = await Promise.all([
    supabase.from('scans').select('id').eq('user_id', user.id),
    supabase.from('progress_entries').select('fecha').eq('user_id', user.id),
    supabase.from('ejercicio_completado').select('fecha, completado').eq('user_id', user.id).eq('completado', true).order('fecha', { ascending: false }),
    supabase.from('profiles').select('nutrition_plan, created_at').eq('id', user.id).single(),
  ]);

  if ((scans?.length ?? 0) >= 1) await desbloquearLogro('primer_escaneo');
  if (profile?.nutrition_plan) await desbloquearLogro('primer_plan');
  if ((progress?.length ?? 0) >= 7) await desbloquearLogro('primera_semana');

  let racha = 0;
  for (let i = 0; i < (ejercicio ?? []).length; i++) {
    const esperado = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if ((ejercicio ?? [])[i].fecha === esperado) racha++;
    else break;
  }
  if (racha >= 7) await desbloquearLogro('racha_7');
  if (racha >= 30) await desbloquearLogro('racha_30');

  if (profile?.created_at) {
    const dias = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (dias >= 30) await desbloquearLogro('primer_mes');
  }
}
