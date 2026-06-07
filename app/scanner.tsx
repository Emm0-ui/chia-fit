import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#22C55E';

const BARCODE_TYPES = [
  BarCodeScanner.Constants.BarCodeType.ean13,
  BarCodeScanner.Constants.BarCodeType.ean8,
  BarCodeScanner.Constants.BarCodeType.upc_a,
  BarCodeScanner.Constants.BarCodeType.upc_e,
  BarCodeScanner.Constants.BarCodeType.code128,
];

type ProductInfo = {
  name: string;
  calories: string;
  sugars: string;
  fat: string;
};

type OpenFoodFactsResponse = {
  status: number;
  product?: {
    product_name?: string;
    nutriments?: {
      'energy-kcal'?: number;
      'energy-kcal_100g'?: number;
      sugars?: number;
      sugars_100g?: number;
      fat?: number;
      fat_100g?: number;
    };
  };
};

function formatNutrient(value: number | undefined, unit: string): string {
  if (value === undefined || Number.isNaN(value)) {
    return 'N/D';
  }
  return `${value} ${unit}`;
}

async function fetchProduct(barcode: string): Promise<ProductInfo | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  );

  if (!response.ok) {
    throw new Error('Error al consultar el producto');
  }

  const data: OpenFoodFactsResponse = await response.json();

  if (data.status !== 1 || !data.product) {
    return null;
  }

  const nutriments = data.product.nutriments ?? {};

  return {
    name: data.product.product_name || 'Producto sin nombre',
    calories: formatNutrient(
      nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'],
      'kcal'
    ),
    sugars: formatNutrient(nutriments.sugars_100g ?? nutriments.sugars, 'g'),
    fat: formatNutrient(nutriments.fat_100g ?? nutriments.fat, 'g'),
  };
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!isScanning || isLoading || data === lastScannedRef.current) {
        return;
      }

      lastScannedRef.current = data;
      setIsScanning(false);
      setIsLoading(true);
      setNotFound(false);
      setProduct(null);
      setError(null);

      try {
        const result = await fetchProduct(data);

        if (result) {
          setProduct(result);
        } else {
          setNotFound(true);
        }
      } catch {
        setError('No se pudo obtener la información del producto');
      } finally {
        setIsLoading(false);
      }
    },
    [isScanning, isLoading]
  );

  const handleScanAgain = () => {
    lastScannedRef.current = null;
    setIsScanning(true);
    setProduct(null);
    setNotFound(false);
    setError(null);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={GREEN} />
        <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
        <Text style={styles.permissionText}>
          Zesty necesita usar tu cámara para escanear códigos de barras de alimentos.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir cámara</Text>
        </Pressable>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Escanear alimento</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <Text style={styles.hint}>Apunta al código de barras del producto</Text>
        </View>

        <View style={styles.resultContainer}>
          {isLoading && (
            <View style={styles.card}>
              <ActivityIndicator size="small" color={GREEN} />
              <Text style={styles.loadingText}>Buscando producto...</Text>
            </View>
          )}

          {notFound && !isLoading && (
            <View style={styles.card}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.notFoundText}>Producto no encontrado</Text>
              <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
                <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
              </Pressable>
            </View>
          )}

          {error && !isLoading && (
            <View style={styles.card}>
              <Ionicons name="cloud-offline-outline" size={32} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
                <Text style={styles.scanAgainText}>Intentar de nuevo</Text>
              </Pressable>
            </View>
          )}

          {product && !isLoading && (
            <View style={styles.card}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.nutrientsRow}>
                <NutrientItem label="Calorías" value={product.calories} />
                <NutrientItem label="Azúcares" value={product.sugars} />
                <NutrientItem label="Grasas" value={product.fat} />
              </View>
              <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
                <Text style={styles.scanAgainText}>Escanear otro producto</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function NutrientItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrientItem}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scanArea: {
    alignItems: 'center',
    gap: 16,
  },
  scanFrame: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: GREEN,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  nutrientsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 8,
  },
  nutrientItem: {
    alignItems: 'center',
    gap: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  scanAgainButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
  },
  scanAgainText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  permissionText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 8,
    padding: 8,
  },
  backLinkText: {
    color: '#6B7280',
    fontSize: 15,
  },
});
