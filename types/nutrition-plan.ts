export type ComidaPlan = {
  nombre: string;
  descripcion: string;
  calorias: number;
};

export type DiaPlan = {
  dia: string;
  comidas: ComidaPlan[];
};

export type DiaEjercicio = {
  dia: string;
  actividad: string;
  duracion: string;
  descripcion: string;
};

export type CategoriaCompra = {
  categoria: string;
  items: string[];
};

export type NutritionPlan = {
  resumen: string;
  caloriasDiarias: number;
  macros: {
    proteinas: string;
    carbohidratos: string;
    grasas: string;
  };
  duracionRecomendada: string;
  cuandoReevaluar: string[];
  planNutricional: DiaPlan[];
  rutinaEjercicio: DiaEjercicio[];
  listaCompras: CategoriaCompra[];
  consejos: string[];
};
