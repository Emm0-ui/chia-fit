import { supabase } from '@/lib/supabase';
import type { OnboardingData } from '@/types/onboarding';

export async function saveOnboardingToProfile(data: OnboardingData): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para guardar tu plan');
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    onboarding_completed: true,
    onboarding_data: {
      objetivo: data.objetivo,
      sexo: data.sexo,
      edad: Number(data.edad),
      peso_kg: Number(data.pesoKg),
      altura_cm: Number(data.alturaCm),
      condiciones: data.condiciones,
      alergias: data.alergias,
      alergia_otra: data.alergiaOtra || null,
      actividad: data.actividad,
      comidas: data.comidas,
      presupuesto: data.presupuesto,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
