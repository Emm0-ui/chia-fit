import type {
  Alergia,
  ComidasDia,
  Condicion,
  NivelActividad,
  Objetivo,
  Presupuesto,
  Sexo,
} from '@/types/onboarding';

export const OBJETIVO_OPTIONS: { value: Objetivo; label: string; icon: string }[] = [
  { value: 'bajar_peso', label: 'Bajar de peso', icon: 'trending-down-outline' },
  { value: 'mantener_peso', label: 'Mantener mi peso', icon: 'remove-outline' },
  { value: 'ganar_musculo', label: 'Ganar músculo', icon: 'barbell-outline' },
  { value: 'comer_saludable', label: 'Comer más saludable', icon: 'leaf-outline' },
];

export const SEXO_OPTIONS: { value: Sexo; label: string }[] = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
];

export const CONDICION_OPTIONS: { value: Condicion; label: string }[] = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol_alto', label: 'Colesterol alto' },
  { value: 'embarazo', label: 'Embarazo' },
  { value: 'vegano_vegetariano', label: 'Vegano/Vegetariano' },
  { value: 'intolerancia_gluten', label: 'Intolerancia al gluten' },
];

export const ALERGIA_OPTIONS: { value: Alergia; label: string }[] = [
  { value: 'nueces', label: 'Nueces' },
  { value: 'mariscos', label: 'Mariscos' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'huevo', label: 'Huevo' },
  { value: 'soya', label: 'Soya' },
  { value: 'trigo', label: 'Trigo' },
  { value: 'otra', label: 'Otra' },
];

export const ACTIVIDAD_OPTIONS: { value: NivelActividad; label: string; subtitle: string }[] = [
  { value: 'sedentario', label: 'Sedentario', subtitle: 'Poco o ningún ejercicio' },
  { value: 'ligero', label: 'Ligero', subtitle: '1-3 días/semana' },
  { value: 'moderado', label: 'Moderado', subtitle: '3-5 días/semana' },
  { value: 'activo', label: 'Activo', subtitle: '6-7 días/semana' },
];

export const COMIDAS_OPTIONS: { value: ComidasDia; label: string }[] = [
  { value: '3_principales', label: '3 comidas principales' },
  { value: '3_mas_2_snacks', label: '3 comidas + 2 snacks' },
  { value: '5_pequenas', label: '5 comidas pequeñas' },
];

export const PRESUPUESTO_OPTIONS: { value: Presupuesto; label: string; subtitle: string }[] = [
  { value: 'economico', label: 'Económico', subtitle: 'Menos de $500 pesos' },
  { value: 'moderado', label: 'Moderado', subtitle: '$500 - $1,500 pesos' },
  { value: 'sin_limite', label: 'Sin límite', subtitle: 'Sin restricción de presupuesto' },
];
