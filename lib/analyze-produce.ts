import { supabase } from '@/lib/supabase';
import type { ProduceReport } from '@/types/produce-report';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un experto en frutas y verduras que analiza fotografías para determinar el estado de madurez.
Tu tarea es observar la imagen y dar una evaluación clara y útil para un consumidor en México.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "nombre": "nombre de la fruta o verdura identificada (ej: 'Plátano', 'Aguacate', 'Jitomate')",
  "madurez": "aun_no" | "perfecta" | "comela_hoy" | "ya_paso",
  "diasParaConsumo": "texto breve sobre cuándo consumir (ej: 'Lista para comer ahora', 'Espera 2-3 días', 'Cómela hoy antes de que pase')",
  "comoConservar": "instrucción breve de conservación (ej: 'Guárdala en el refrigerador', 'Déjala a temperatura ambiente', 'Congélala si no la vas a comer hoy')",
  "senalesVisuales": ["señal 1", "señal 2", "señal 3"]
}

Escala de madurez:
- aun_no: La fruta/verdura está verde o inmadura. Necesita días para madurar.
- perfecta: Está en su punto óptimo de madurez. Ideal para consumir ahora.
- comela_hoy: Está madura o muy madura. Hay que consumirla hoy o mañana.
- ya_paso: Está sobremadura, con signos de deterioro. Ya no es ideal para consumir.

Reglas:
- Identifica la fruta o verdura con certeza. Si no puedes identificarla, escribe "No identificado" en nombre.
- Las señales visuales deben describir LO QUE VES en la imagen (color, textura, manchas, firmeza aparente).
- La conservación debe ser práctica y específica para México (temperatura ambiente, refrigerador, etc.).
- Si la imagen no muestra una fruta o verdura, devuelve madurez "aun_no", diasParaConsumo "No se detectó fruta o verdura", comoConservar "N/A" y senalesVisuales con una sola señal explicando que no se pudo analizar.`;

function extractJson(text: string): ProduceReport {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Respuesta inválida de Claude');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ProduceReport;

  if (!parsed.nombre || !parsed.madurez || !parsed.diasParaConsumo) {
    throw new Error('El informe no tiene el formato esperado');
  }

  return parsed;
}

export async function analyzeProduce(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg',
  nombreCorrecto?: string
): Promise<ProduceReport> {

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
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: nombreCorrecto ? `Esta es un(a) ${nombreCorrecto}. Analiza su estado de madurez en JSON.` : 'Analiza esta fruta o verdura y determina su estado de madurez en JSON.',
            },
          ],
        },
      ],
    }),
  });

  if (response.status === 403) {
    const errData = await response.json();
    if (errData.error === "limite_alcanzado") {
      const limErr = new Error(errData.mensaje); limErr.name = "LimitError"; throw limErr;
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