import { supabase } from '@/lib/supabase';
import type { CravingReport } from '@/types/craving-report';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un nutricionista empático que ayuda a personas a entender el impacto real de algo que comieron fuera de su plan, sin generar culpa.

Tu tarea es analizar la descripción de un alimento o bebida que la persona consumió (que no estaba en su plan) y dar información práctica y compasiva.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "alimentoIdentificado": "nombre del alimento o bebida descrito",
  "caloriasEstimadas": número entero de calorías estimadas de una porción típica,
  "impactoNivel": "bajo" | "moderado" | "alto",
  "mensaje": "mensaje breve, empático y sin culpa sobre el alimento (2-3 oraciones)",
  "comoCompensar": ["sugerencia práctica 1", "sugerencia práctica 2"],
  "sugerenciasProximaComida": "sugerencia concreta y breve para la siguiente comida del día"
}

Reglas:
- NUNCA uses un tono de regaño, culpa o juicio. El objetivo es informar, no castigar.
- impactoNivel "bajo" = no afecta significativamente el objetivo del día. "moderado" = se puede compensar fácilmente. "alto" = requiere ajustes más notorios en el resto del día.
- Las sugerencias de compensación deben ser realistas y saludables (ej: caminar, ajustar la próxima comida, tomar más agua) — nunca sugerir restricción extrema, ayuno prolongado o ejercicio excesivo como "castigo".
- El mensaje debe transmitir que un antojo ocasional es normal y no arruina el progreso general.
- Si la descripción no es un alimento o bebida reconocible, indícalo claramente en el mensaje.`;

function extractJson(text: string): CravingReport {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Respuesta inválida de Claude');
  }

  const parsed = JSON.parse(jsonMatch[0]) as CravingReport;

  if (!parsed.alimentoIdentificado || !parsed.mensaje) {
    throw new Error('El informe no tiene el formato esperado');
  }

  return parsed;
}

export async function analyzeCraving(descripcion: string): Promise<CravingReport> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Debes iniciar sesión para usar esta función');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-request-type': 'scan',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analiza esto que comí o bebí fuera de mi plan: "${descripcion}"`,
        },
      ],
    }),
  });

  if (response.status === 403) {
    const errData = await response.json();
    if (errData.error === "limite_alcanzado") {
      const limErr = new Error(errData.mensaje);
      limErr.name = "LimitError";
      throw limErr;
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de Claude API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text');

  if (!textBlock?.text) {
    throw new Error('Claude no devolvió una respuesta de texto');
  }

  return extractJson(textBlock.text);
}
