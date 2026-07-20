import { supabase } from '@/lib/supabase';
import type { NutritionPlan } from '@/types/nutrition-plan';
import type { OnboardingData } from '@/types/onboarding';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un nutricionista y entrenador personal experto. Genera planes personalizados en español para usuarios en México.
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown) con esta estructura:
{
  "resumen": "resumen breve del plan personalizado",
  "caloriasDiarias": 2000,
  "macros": { "proteinas": "120g", "carbohidratos": "200g", "grasas": "65g" },
  "duracionRecomendada": "texto claro indicando por cuánto tiempo seguir este plan antes de reevaluar (ej: '4 a 6 semanas antes de ajustar según tu progreso')",
  "cuandoReevaluar": ["señal 1 de que se debe reevaluar antes de tiempo", "señal 2", "señal 3"],
  "planNutricional": [
    { "dia": "Lunes", "comidas": [{ "nombre": "Desayuno", "descripcion": "...", "calorias": 400 }] }
  ],
  "rutinaEjercicio": [
    { "dia": "Lunes", "actividad": "Caminata", "duracion": "30 min", "descripcion": "..." }
  ],
  "listaCompras": [
    { "categoria": "Proteínas", "items": ["pollo", "huevo"] }
  ],
  "consejos": ["consejo 1", "consejo 2", "consejo 3"]
}

Reglas:
- planNutricional debe cubrir 7 días con comidas acordes a las preferencias del usuario.
- rutinaEjercicio debe cubrir 7 días acorde al nivel de actividad.
- listaCompras debe ser práctica para el presupuesto indicado (en pesos mexicanos). Cada item debe incluir el precio estimado en rango, diferenciando mercado local y supermercado cuando aplique. Ejemplo: "Pechuga de pollo 1kg — mercado: $110-$130 / super: $130-$160".
- Al final de listaCompras agrega una categoría especial llamada "💰 Total estimado" con un solo item que diga el rango total de la compra semanal de forma amigable. Ejemplo: "Tu compra de la semana: entre $900 y $1,300 pesos dependiendo dónde compres 🛒".
- Los precios deben ser realistas para México en 2026. Referencia oficial: la canasta básica de Profeco (24 productos esenciales) cuesta $800-$900 pesos/semana para una familia de 4, y una dieta balanceada completa por persona cuesta $1,000-$1,300 pesos/semana. Usa esto como ancla para tus estimaciones de precios.
- Respeta condiciones médicas, alergias y restricciones alimentarias.
- Usa alimentos accesibles en México.
- duracionRecomendada debe basarse en criterio nutricional real: para pérdida de peso, 4-6 semanas antes de reevaluar; para ganancia muscular, 6-8 semanas; para mantenimiento o alimentación saludable general, 8-12 semanas. Ajusta según edad, condiciones médicas y magnitud del objetivo.
- cuandoReevaluar debe incluir 3-4 señales concretas y accionables (ej: pérdida/ganancia de peso más rápida o más lenta de lo esperado, cambios en energía o rendimiento, aparición de síntomas nuevos, o cumplir el tiempo recomendado sin cambios).
- Si el usuario declaró alguna condición médica, incluye en consejos una recomendación explícita de supervisión por un profesional de la salud para ajustes de este plan a mediano/largo plazo.`;

function extractJson(text: string): NutritionPlan {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Respuesta inválida de Claude');
  }
  return JSON.parse(jsonMatch[0]) as NutritionPlan;
}

const LABELS: Record<string, Record<string, string>> = {
  objetivo: {
    bajar_peso: 'Bajar de peso',
    mantener_peso: 'Mantener mi peso',
    ganar_musculo: 'Ganar músculo',
    comer_saludable: 'Comer más saludable',
  },
  actividad: {
    sedentario: 'Sedentario',
    ligero: 'Ligero (1-3 días/semana)',
    moderado: 'Moderado (3-5 días/semana)',
    activo: 'Activo (6-7 días/semana)',
  },
  comidas: {
    '3_principales': '3 comidas principales',
    '3_mas_2_snacks': '3 comidas + 2 snacks',
    '5_pequenas': '5 comidas pequeñas',
  },
  presupuesto: {
    economico: 'Económico (menos de $800 pesos)',
    moderado: 'Moderado ($800 - $1,300 pesos)',
    sin_limite: 'Holgado (más de $1,300 pesos)',
  },
};

export async function generateNutritionPlan(data: OnboardingData): Promise<NutritionPlan> {

  const userPrompt = `Genera un plan nutricional personalizado + rutina de ejercicio semanal + lista de compras para este usuario:

Objetivo: ${LABELS.objetivo[data.objetivo ?? ''] ?? data.objetivo}
Sexo: ${data.sexo === 'hombre' ? 'Hombre' : 'Mujer'}
Edad: ${data.edad} años
Peso: ${data.pesoKg} kg
Altura: ${data.alturaCm} cm
Condiciones: ${data.condiciones.join(', ') || 'Ninguna'}
Alergias: ${data.alergias.join(', ') || 'Ninguna'}${data.alergiaOtra ? ` (Otra: ${data.alergiaOtra})` : ''}
Nivel de actividad: ${LABELS.actividad[data.actividad ?? ''] ?? data.actividad}
Comidas al día: ${LABELS.comidas[data.comidas ?? ''] ?? data.comidas}
Presupuesto semanal: ${LABELS.presupuesto[data.presupuesto ?? ''] ?? data.presupuesto}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("Debes iniciar sesión para usar esta función");
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de Claude API (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const textBlock = result.content?.find((block: { type: string }) => block.type === 'text');

  if (!textBlock?.text) {
    throw new Error('Claude no devolvió una respuesta de texto');
  }

  return extractJson(textBlock.text);
}
