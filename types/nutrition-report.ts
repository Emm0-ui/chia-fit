export type TrafficLight = 'verde' | 'amarillo' | 'rojo';

export type Rating = 'Excelente' | 'Bueno' | 'Regular' | 'Evítalo';

export type Nutrient = {
  nombre: string;
  cantidad: string;
  descripcionSimple: string;
};

export type NutritionReport = {
  nombreProducto: string;
  nutrientes: Nutrient[];
  semaforo: TrafficLight;
  puntosClave: [string, string, string];
  calificacion: Rating;
};
