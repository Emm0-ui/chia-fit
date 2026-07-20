import type { Rating, TrafficLight } from '@/types/nutrition-report';

export type DishReport = {
  nombrePlatillo: string;
  caloriasTotales: number;
  macros: {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
  ingredientesDetectados: string[];
  semaforo: TrafficLight;
  puntosClave: [string, string, string];
  calificacion: Rating;
};