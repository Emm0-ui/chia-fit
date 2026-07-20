import { Share } from 'react-native';
import { supabase } from '@/lib/supabase';

export async function exportarDatos(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const [{ data: progreso }, { data: scans }, { data: consumo }, { data: hidratacion }] = await Promise.all([
    supabase.from('progress_entries').select('*').eq('user_id', user.id).order('fecha'),
    supabase.from('scans').select('nombre_producto, semaforo, calificacion, created_at').eq('user_id', user.id).order('created_at'),
    supabase.from('consumo_diario').select('nombre, calorias, proteinas, carbohidratos, grasas, fecha').eq('user_id', user.id).order('fecha'),
    supabase.from('hidratacion_diaria').select('fecha, vasos').eq('user_id', user.id).order('fecha'),
  ]);

  let texto = 'ChIA Fit — Exportación de datos\n\n';
  
  texto += 'HISTORIAL DE PESO\n';
  if ((progreso ?? []).length === 0) {
    texto += 'Sin registros\n';
  } else {
    (progreso ?? []).forEach((p: any) => { texto += `${p.fecha}: ${p.peso_kg} kg${p.cintura_cm ? ` · ${p.cintura_cm} cm cintura` : ''}\n`; });
  }

  texto += '\nHISTORIAL DE ESCANEOS\n';
  if ((scans ?? []).length === 0) {
    texto += 'Sin registros\n';
  } else {
    (scans ?? []).forEach((s: any) => { texto += `${new Date(s.created_at).toLocaleDateString('es-MX')}: ${s.nombre_producto} — ${s.calificacion}\n`; });
  }

  texto += '\nCONSUMO DE ALIMENTOS\n';
  if ((consumo ?? []).length === 0) {
    texto += 'Sin registros\n';
  } else {
    (consumo ?? []).forEach((c: any) => { texto += `${c.fecha}: ${c.nombre} — ${c.calorias} kcal\n`; });
  }

  texto += '\nHIDRATACIÓN\n';
  if ((hidratacion ?? []).length === 0) {
    texto += 'Sin registros\n';
  } else {
    (hidratacion ?? []).forEach((h: any) => { texto += `${h.fecha}: ${h.vasos} vasos\n`; });
  }

  await Share.share({ message: texto, title: 'Mis datos de ChIA Fit' });
}
