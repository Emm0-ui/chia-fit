import type { NutritionReport } from '@/types/nutrition-report';

const OFF_API = 'https://world.openfoodfacts.org/api/v2/product';

export type OFFProduct = {
  found: boolean;
  nombreProducto: string;
  nutrientes: Array<{ nombre: string; cantidad: string; descripcionSimple: string }>;
  calorias: number | null;
};

export async function fetchProductByBarcode(barcode: string): Promise<OFFProduct> {
  try {
    const response = await fetch(`${OFF_API}/${barcode}.json?fields=product_name,nutriments,nutriscore_grade,labels`, {
      headers: { 'User-Agent': 'ChIAFit/1.0 (Android; chiafit@gmail.com)' },
    });

    if (!response.ok) return { found: false, nombreProducto: '', nutrientes: [], calorias: null };

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return { found: false, nombreProducto: '', nutrientes: [], calorias: null };
    }

    const product = data.product;
    const nutriments = product.nutriments ?? {};

    const nombre = product.product_name_es ?? product.product_name ?? 'Producto desconocido';

    const nutrientes = [];

    if (nutriments['energy-kcal_100g'] != null) {
      nutrientes.push({
        nombre: 'Calorías',
        cantidad: `${Math.round(nutriments['energy-kcal_100g'])} kcal/100g`,
        descripcionSimple: 'Energía por cada 100 gramos del producto',
      });
    }

    if (nutriments['proteins_100g'] != null) {
      nutrientes.push({
        nombre: 'Proteínas',
        cantidad: `${nutriments['proteins_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Proteínas por cada 100 gramos',
      });
    }

    if (nutriments['carbohydrates_100g'] != null) {
      nutrientes.push({
        nombre: 'Carbohidratos',
        cantidad: `${nutriments['carbohydrates_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Carbohidratos totales por cada 100 gramos',
      });
    }

    if (nutriments['sugars_100g'] != null) {
      nutrientes.push({
        nombre: 'Azúcares',
        cantidad: `${nutriments['sugars_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Azúcares incluidos en los carbohidratos',
      });
    }

    if (nutriments['fat_100g'] != null) {
      nutrientes.push({
        nombre: 'Grasas',
        cantidad: `${nutriments['fat_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Grasas totales por cada 100 gramos',
      });
    }

    if (nutriments['saturated-fat_100g'] != null) {
      nutrientes.push({
        nombre: 'Grasas saturadas',
        cantidad: `${nutriments['saturated-fat_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Grasas saturadas — consumir con moderación',
      });
    }

    if (nutriments['sodium_100g'] != null) {
      const sodioMg = (nutriments['sodium_100g'] * 1000).toFixed(0);
      nutrientes.push({
        nombre: 'Sodio',
        cantidad: `${sodioMg}mg/100g`,
        descripcionSimple: 'Sodio — alto consumo relacionado con presión arterial',
      });
    }

    if (nutriments['fiber_100g'] != null) {
      nutrientes.push({
        nombre: 'Fibra',
        cantidad: `${nutriments['fiber_100g'].toFixed(1)}g/100g`,
        descripcionSimple: 'Fibra dietética — beneficiosa para la digestión',
      });
    }

    return {
      found: true,
      nombreProducto: nombre,
      nutrientes,
      calorias: nutriments['energy-kcal_100g'] ? Math.round(nutriments['energy-kcal_100g']) : null,
    };
  } catch {
    return { found: false, nombreProducto: '', nutrientes: [], calorias: null };
  }
}

export function offProductToReport(product: OFFProduct, calorias: number): NutritionReport {
  const cal = product.calorias ?? calorias;
  let semaforo: 'verde' | 'amarillo' | 'rojo' = 'amarillo';
  let calificacion: 'Excelente' | 'Bueno' | 'Regular' | 'Evítalo' = 'Regular';

  const sodio = product.nutrientes.find(n => n.nombre === 'Sodio');
  const azucar = product.nutrientes.find(n => n.nombre === 'Azúcares');
  const grasasSat = product.nutrientes.find(n => n.nombre === 'Grasas saturadas');

  const sodioVal = sodio ? parseFloat(sodio.cantidad) : 0;
  const azucarVal = azucar ? parseFloat(azucar.cantidad) : 0;
  const grasasSatVal = grasasSat ? parseFloat(grasasSat.cantidad) : 0;

  if (cal < 150 && azucarVal < 5 && sodioVal < 400) {
    semaforo = 'verde';
    calificacion = 'Excelente';
  } else if (cal < 300 && azucarVal < 15 && sodioVal < 600) {
    semaforo = 'verde';
    calificacion = 'Bueno';
  } else if (cal < 400 && azucarVal < 20 && sodioVal < 800) {
    semaforo = 'amarillo';
    calificacion = 'Regular';
  } else {
    semaforo = 'rojo';
    calificacion = 'Evítalo';
  }

  return {
    nombreProducto: product.nombreProducto,
    semaforo,
    calificacion,
    nutrientes: product.nutrientes,
    puntosClave: [
      `Datos verificados de la base de datos oficial Open Food Facts`,
      `Valores nutricionales por cada 100 gramos del producto`,
      sodioVal > 600 ? 'Alto contenido de sodio — consumir con moderación' :
        azucarVal > 15 ? 'Alto contenido de azúcares — revisar porciones' :
          'Revisa el tamaño de porción en el empaque para calcular tu consumo real',
    ],
  };
}
