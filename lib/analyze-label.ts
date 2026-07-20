import { supabase } from '@/lib/supabase';
import type { NutritionReport } from '@/types/nutrition-report';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un nutricionista experto que analiza etiquetas de información nutricional de productos alimenticios.
Tu tarea es leer la imagen de una etiqueta nutricional y generar un informe claro en español para consumidores sin conocimientos técnicos.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "nombreProducto": "nombre del producto si es visible, o 'Producto' si no se puede leer",
  "nutrientes": [
    {
      "nombre": "nombre del nutriente",
      "cantidad": "cantidad exacta con unidad (ej: 24g, 150mg, 320 kcal)",
      "descripcionSimple": "equivalencia en lenguaje cotidiano (ej: equivale a unas 3 cucharadas de azúcar)"
    }
  ],
  "semaforo": "verde" | "amarillo" | "rojo",
  "puntosClave": ["punto 1", "punto 2", "punto 3"],
  "calificacion": "Excelente" | "Bueno" | "Regular" | "Evítalo"
}

Reglas:
- Incluye los nutrientes más relevantes que aparezcan en la etiqueta (mínimo 4, máximo 8).
- El semáforo verde = saludable, amarillo = consumir con moderación, rojo = poco saludable.
- Los 3 puntos clave deben ser breves, directos y fáciles de entender.
- Si la imagen no es legible o no es una etiqueta nutricional, devuelve nutrientes vacíos, semaforo "rojo", calificacion "Evítalo" y en puntosClave explica que no se pudo leer la etiqueta.`;

function extractJson(text: string): NutritionReport {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Respuesta inválida de Claude');
  }

  const parsed = JSON.parse(jsonMatch[0]) as NutritionReport;

  if (!parsed.nutrientes || !parsed.semaforo || !parsed.calificacion) {
    throw new Error('El informe no tiene el formato esperado');
  }

  return parsed;
}

export async function analyzeNutritionLabel(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<NutritionReport> {

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
              text: 'Analiza esta etiqueta de información nutricional y genera el informe en JSON.',
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
