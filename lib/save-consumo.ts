import { supabase } from '@/lib/supabase';
import type { DishReport } from '@/types/dish-report';

function fechaLocalHoy(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function saveConsumo(report: DishReport): Promise<{ ok: boolean; mensaje: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, mensaje: 'Debes iniciar sesión para registrar tu consumo' };
  }

  const { error } = await supabase.from('consumo_diario').insert({
    user_id: user.id,
    nombre: report.nombrePlatillo,
    calorias: report.caloriasTotales,
    proteinas: report.macros.proteinas,
    carbohidratos: report.macros.carbohidratos,
    grasas: report.macros.grasas,
    fecha: fechaLocalHoy(),
  });

  if (error) {
    return { ok: false, mensaje: 'No se pudo guardar. Intenta de nuevo.' };
  }

  return { ok: true, mensaje: 'Agregado a tu día 🥝' };
}