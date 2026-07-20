export type CravingReport = {
  alimentoIdentificado: string;
  caloriasEstimadas: number;
  impactoNivel: "bajo" | "moderado" | "alto";
  mensaje: string;
  comoCompensar: string[];
  sugerenciasProximaComida: string;
};
