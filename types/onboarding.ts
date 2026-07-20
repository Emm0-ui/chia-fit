export type Objetivo = 'bajar_peso' | 'mantener_peso' | 'ganar_musculo' | 'comer_saludable';

export type Sexo = 'hombre' | 'mujer';

export type Condicion =
  | 'ninguna'
  | 'diabetes'
  | 'hipertension'
  | 'colesterol_alto'
  | 'embarazo'
  | 'vegano_vegetariano'
  | 'intolerancia_gluten';

export type Alergia = 'nueces' | 'mariscos' | 'lacteos' | 'huevo' | 'soya' | 'trigo' | 'otra';

export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo';

export type ComidasDia = '3_principales' | '3_mas_2_snacks' | '5_pequenas';

export type Presupuesto = 'economico' | 'moderado' | 'sin_limite';

export type OnboardingData = {
  objetivo: Objetivo | null;
  sexo: Sexo | null;
  edad: string;
  pesoKg: string;
  alturaCm: string;
  cinturaCm: string;
  condiciones: Condicion[];
  alergias: Alergia[];
  alergiaOtra: string;
  actividad: NivelActividad | null;
  comidas: ComidasDia | null;
  presupuesto: Presupuesto | null;
};

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  objetivo: null,
  sexo: null,
  edad: '',
  pesoKg: '',
  alturaCm: '',
  cinturaCm: '',
  condiciones: [],
  alergias: [],
  alergiaOtra: '',
  actividad: null,
  comidas: null,
  presupuesto: null,
};
