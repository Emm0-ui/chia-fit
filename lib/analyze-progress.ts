import { supabase } from '@/lib/supabase';
import type { ProgressReport } from '@/types/progress-report';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un coach de nutrición y bienestar empático que analiza el progreso real de una persona y genera un mensaje motivacional personalizado.

Tu tarea es analizar los datos de progreso del usuario y generar una respuesta que:
1. Sea honesta sobre el progreso real (sin exagerar ni minimizar)
2. Sea emocionalmente inteligente — celebra logros, alienta en momentos difíciles, redirige sin culpa
3. Tome en cuenta la adherencia al plan de ejercicio
4. Sugiera una búsqueda de YouTube contextual que complemente el mensaje

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown) con esta estructura:
{
  "mensaje": "mensaje motivacional personalizado y empático (3-5 oraciones)",
  "tono": "celebracion" | "aliento" | "redireccion",
  "ritmoActual": "descripción breve del ritmo de progreso actual (ej: 'Vas a un ritmo saludable de 0.5kg por semana')",
  "tiempoEstimadoObjetivo": "estimación honesta de tiempo para alcanzar el objetivo (ej: 'A este ritmo, alcanzarás tu meta en aproximadamente 8 semanas')",
  "recomendacion": "una recomendación concreta y accionable para la próxima semana",
  "youtubeQuery": "búsqueda de YouTube en español que complemente el mensaje (ej: 'historia de transformación real pérdida de peso motivación', 'cómo retomar hábitos saludables después de una caída', 'por qué los primeros 21 días son los más difíciles')"
}

Reglas de tono:
- "celebracion": cuando el progreso es consistente y positivo — el mensaje debe sentirse como un abrazo y reconocimiento genuino
- "aliento": cuando hay progreso pero inconsistente, o primera semana — el mensaje debe sentirse como un amigo que cree en ti
- "redireccion": cuando hay poca adherencia o el progreso se estancó — NUNCA usar culpa, siempre redirigir con compasión y estrategia práctica

IMPORTANTE: El mensaje nunca debe sonar como un bot genérico. Debe sentirse como si alguien leyó tu historia específica y te escribió a ti personalmente.`;

function extractJson(text: string): ProgressReport {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Respuesta inválida');
  const parsed = JSON.parse(jsonMatch[0]) as ProgressReport;
  if (!parsed.mensaje || !parsed.tono) throw new Error('Formato inválido');
  return parsed;
}

export async function analyzeProgress(params: {
  pesoInicial: number;
  pesoActual: number;
  pesoObjetivo: number;
  objetivo: string;
  diasConPlan: number;
  diasEjercicioCompletados: number;
  diasEjercicioTotal: number;
  nombre: string;
}): Promise<ProgressReport> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error('Debes iniciar sesión para usar esta función');

  const adherencia = params.diasEjercicioTotal > 0
    ? Math.round((params.diasEjercicioCompletados / params.diasEjercicioTotal) * 100)
    : 0;

  const cambioPeso = params.pesoActual - params.pesoInicial;
  const cambioSigno = cambioPeso < 0 ? 'perdido' : 'ganado';

  const userPrompt = `Analiza el progreso de ${params.nombre}:
- Objetivo: ${params.objetivo}
- Peso inicial: ${params.pesoInicial}kg
- Peso actual: ${params.pesoActual}kg (ha ${cambioSigno} ${Math.abs(cambioPeso).toFixed(1)}kg)
- Peso objetivo: ${params.pesoObjetivo}kg
- Lleva ${params.diasConPlan} días con el plan
- Adherencia al ejercicio: ${params.diasEjercicioCompletados} de ${params.diasEjercicioTotal} días completados (${adherencia}%)`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de Claude API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text');
  if (!textBlock?.text) throw new Error('Claude no devolvió respuesta');

  return extractJson(textBlock.text);
}
