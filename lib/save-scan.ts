import { supabase } from '@/lib/supabase';
import type { NutritionReport } from '@/types/nutrition-report';

export async function saveScan(report: NutritionReport): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from('scans').insert({
    user_id: user.id,
    nombre_producto: report.nombreProducto,
    semaforo: report.semaforo,
    calificacion: report.calificacion,
    reporte: report,
  });

  if (error) {
    console.error('Error al guardar el escaneo:', error.message);
  }
}