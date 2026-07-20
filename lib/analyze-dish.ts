import { supabase } from '@/lib/supabase';
import type { DishReport } from '@/types/dish-report';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un nutricionista experto que analiza fotografías de platillos y comidas preparadas.
Tu tarea es observar la imagen de un platillo y estimar su información nutricional para un consumidor en México.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "nombrePlatillo": "nombre del platillo identificado (ej: 'Tacos de pastor', 'Ensalada César')",
  "caloriasTotales": número entero de calorías estimadas de la porción visible,
  "macros": {
    "proteinas": número entero en gramos,
    "carbohidratos": número entero en gramos,
    "grasas": número entero en gramos
  },
  "ingredientesDetectados": ["ingrediente 1", "ingrediente 2", "ingrediente 3"],
  "semaforo": "verde" | "amarillo" | "rojo",
  "puntosClave": ["punto 1", "punto 2", "punto 3"],
  "calificacion": "Excelente" | "Bueno" | "Regular" | "Evítalo"
}

Reglas:
- Estima las calorías y macros de la porción que se ve en la foto, no de una porción genérica.
- IMPORTANTE: Solo lista ingredientes que veas CON CERTEZA en la imagen. No inventes ni asumas ingredientes que no son claramente visibles. Es mejor listar menos ingredientes correctos que incluir uno que no está.
- Identifica los ingredientes principales visibles (mínimo 2, máximo 8).
- Las calorías son una ESTIMACIÓN, no un valor exacto. Considera que no puedes ver aceites, mantequilla o azúcares ocultos en la preparación, así que estima de forma realista.
- El semáforo verde = saludable, amarillo = consumir con moderación, rojo = poco saludable.
- Los 3 puntos clave deben ser breves, directos y útiles. En uno de ellos recuerda al usuario que las calorías son una estimación aproximada.
- Reconoce platillos mexicanos comunes (tacos, enchiladas, pozole, etc.).
-  Si la imagen no es comida o no es legible, devuelve caloriasTotales 0, macros en 0, ingredientes vacíos, semaforo "rojo", calificacion "Evítalo" y en puntosClave explica que no se pudo analizar el platillo.`;

function extractJson(text: string): DishReport {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Respuesta inválida de Claude');
  }

  const parsed = JSON.parse(jsonMatch[0]) as DishReport;

  if (parsed.caloriasTotales === undefined || !parsed.semaforo || !parsed.calificacion) {
    throw new Error('El informe no tiene el formato esperado');
  }

  return parsed;
}

export async function analyzeDish(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<DishReport> {

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
      max_tokens: 2048,
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
              text: 'Analiza este platillo y estima su información nutricional en JSON.',
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