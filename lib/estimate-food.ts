import { supabase } from '@/lib/supabase';

const CLAUDE_API_URL = 'https://zesty-backend-production.up.railway.app/api/claude';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Eres un experto en nutrición mexicana. El usuario describe un alimento o comida y debes estimar sus valores nutricionales.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown) con esta estructura:
{
  "nombre": "nombre limpio del alimento",
  "calorias": número entero,
  "proteinas": número en gramos,
  "carbohidratos": número en gramos,
  "grasas": número en gramos,
  "nota": "nota breve sobre la estimación"
}

Reglas:
- Usa porciones típicas mexicanas como referencia
- Si el usuario menciona cantidad multiplica por ella
- Si no hay info suficiente usa porción estándar y menciónalo
- Sé conservador en las estimaciones
- Todos los valores deben ser números`;

export type FoodEstimate = {
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  nota: string;
};

export async function estimateFood(descripcion: string): Promise<FoodEstimate> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Debes iniciar sesión');

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: descripcion }],
    }),
  });

  if (!response.ok) throw new Error('Error al estimar el alimento');
  const data = await response.json();
  const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
  const match = text.trim().match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Respuesta inválida');
  const parsed = JSON.parse(match[0]) as FoodEstimate;
  if (!parsed.nombre || !parsed.calorias) throw new Error('Formato inválido');
  return parsed;
}
