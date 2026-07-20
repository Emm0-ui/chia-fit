import { supabase } from '@/lib/supabase';

export type SugerenciaPlan = {
  necesitaActualizar: boolean;
  razon: string;
  diasConRegistros: number;
};

export async function verificarPlanAdaptativo(): Promise<SugerenciaPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { necesitaActualizar: false, razon: '', diasConRegistros: 0 };

  const hace14dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [{ data: progreso }, { data: profile }] = await Promise.all([
    supabase.from('progress_entries').select('peso_kg, fecha').eq('user_id', user.id).gte('fecha', hace14dias).order('fecha'),
    supabase.from('profiles').select('nutrition_plan, onboarding_data').eq('id', user.id).single(),
  ]);

  const registros = progreso ?? [];
  if (registros.length < 3) return { necesitaActualizar: false, razon: '', diasConRegistros: registros.length };

  const pesoInicial = registros[0].peso_kg;
  const pesoActual = registros[registros.length - 1].peso_kg;
  const diferencia = pesoActual - pesoInicial;
  const objetivo = profile?.onboarding_data?.objetivo ?? 'bajar_peso';

  let necesitaActualizar = false;
  let razon = '';

  if (objetivo === 'bajar_peso' && diferencia > 0.5) {
    necesitaActualizar = true;
    razon = `Tu peso subió ${diferencia.toFixed(1)}kg en las últimas 2 semanas. Tu plan puede necesitar ajustes.`;
  } else if (objetivo === 'ganar_musculo' && diferencia < -0.5) {
    necesitaActualizar = true;
    razon = `Tu peso bajó ${Math.abs(diferencia).toFixed(1)}kg. Considera actualizar tu plan para ganar músculo.`;
  } else if (objetivo === 'mantener_peso' && Math.abs(diferencia) > 1.5) {
    necesitaActualizar = true;
    razon = `Tu peso varió ${Math.abs(diferencia).toFixed(1)}kg. Tu plan puede necesitar reajuste.`;
  }

  return { necesitaActualizar, razon, diasConRegistros: registros.length };
}
