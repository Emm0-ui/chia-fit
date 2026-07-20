export type Madurez = 'aun_no' | 'perfecta' | 'comela_hoy' | 'ya_paso';

export type ProduceReport = {
  nombre: string;
  madurez: Madurez;
  diasParaConsumo: string;
  comoConservar: string;
  senalesVisuales: string[];
};