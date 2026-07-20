import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import Paywall from '@/app/components/paywall';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Share, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeDish } from '@/lib/analyze-dish';
import { saveConsumo } from '@/lib/save-consumo';
import { useColors } from '@/lib/theme';
import type { DishReport } from '@/types/dish-report';
import type { Rating, TrafficLight } from '@/types/nutrition-report';

const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  verde: '#16A34A',
  amarillo: '#EAB308',
  rojo: '#EF4444',
};

const RATING_COLORS: Record<Rating, string> = {
  Excelente: '#16A34A',
  Bueno: '#84CC16',
  Regular: '#EAB308',
  'Evítalo': '#EF4444',
};

export default function DishScannerScreen() {
  const c = useColors();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DishReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [consumoMsg, setConsumoMsg] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isAnalyzing) return;
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) throw new Error('No se pudo capturar la imagen');
      setIsAnalyzing(true);
      const mediaType = photo.format === 'png' ? 'image/png' : 'image/jpeg';
      const result = await analyzeDish(photo.base64, mediaType);
      setReport(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'LimitError') { setLimitReached(true); return; }
      setError(err instanceof Error ? err.message : 'Error al analizar el platillo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const semLabel = report.semaforo === 'verde' ? '✅ Saludable' : report.semaforo === 'amarillo' ? '⚠️ Moderación' : '🔴 Poco saludable';
    const puntos = report.puntosClave.map((p: string) => '• ' + p).join('\n');
    const texto = '🌿 Analicé este platillo con ChIA Fit:\n\n🍽️ ' + report.nombrePlatillo + '\n' + semLabel + '\n⭐ Calificación: ' + report.calificacion + '\n🔥 ' + report.caloriasTotales + ' kcal\n\n📋 Puntos clave:\n' + puntos + '\n\n¡Descarga ChIA Fit y analiza lo que comes! 🥦';
    await Share.share({ message: texto });
  };

  const handleReset = () => { setConsumoMsg(null); setReport(null); setError(null); setLimitReached(false); };

  const handleAddToDay = async () => {
    if (!report) return;
    const result = await saveConsumo(report);
    setConsumoMsg(result.mensaje);
  };

  if (!fontsLoaded || !permission) {
    return <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.green} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }}>
        <Ionicons name="restaurant-outline" size={64} color={c.green} />
        <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Acceso a la cámara</Text>
        <Text style={{ fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>ChIA Fit necesita usar tu cámara para fotografiar tus platillos.</Text>
        <Pressable style={{ backgroundColor: c.green, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14 }} onPress={requestPermission}>
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Permitir cámara</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={{ color: c.textMuted, fontSize: 15 }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (limitReached) {
    return <Paywall mensaje="Alcanzaste tus 20 escaneos gratuitos de este mes." onVolver={() => { setLimitReached(false); router.back(); }} />;
  }

  if (report) {
    const ratingColor = RATING_COLORS[report.calificacion];
    const semColor = TRAFFIC_LIGHT_COLORS[report.semaforo];
    const semLabel = report.semaforo === 'verde' ? 'Saludable' : report.semaforo === 'amarillo' ? 'Moderación' : 'Poco saludable';
    const semIcon = report.semaforo === 'verde' ? 'leaf' : report.semaforo === 'amarillo' ? 'warning' : 'close-circle';
    const prot = report.macros.proteinas ?? 0;
    const carb = report.macros.carbohidratos ?? 0;
    const gras = report.macros.grasas ?? 0;
    const totalMacros = prot + carb + gras || 1;

    const MacroBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
      const pct = Math.min(Math.round((value / totalMacros) * 100), 100);
      return (
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: c.textMuted }}>{label}</Text>
            <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_600SemiBold', color }}>{value}g · {pct}%</Text>
          </View>
          <View style={{ height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
          </View>
        </View>
      );
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
              <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
            </Pressable>
            <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Análisis del platillo</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Score Hero */}
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: ratingColor, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, gap: 2 }}>
              <Text style={{ fontSize: 32 }}>{report.semaforo === 'verde' ? '🥗' : report.semaforo === 'amarillo' ? '⚠️' : '🚫'}</Text>
              <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', color: ratingColor }}>{report.calificacion}</Text>
            </View>
            <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>{report.nombrePlatillo}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: semColor, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 }}>
              <Ionicons name={semIcon as any} size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' }}>{semLabel}</Text>
            </View>
          </View>

          {/* Calorías + Macros */}
          <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: c.borderGreen }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 4 }}>
                <Text style={{ fontSize: 40, fontFamily: 'PlusJakartaSans_700Bold', color: c.green }}>{report.caloriasTotales}</Text>
                <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>kcal estimadas</Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: c.border, alignSelf: 'stretch' }} />
              <View style={{ flex: 1, gap: 10 }}>
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary, marginBottom: 2 }}>Macros</Text>
                <MacroBar label="Proteínas" value={prot} color="#F97316" />
                <MacroBar label="Carbohidratos" value={carb} color="#3B82F6" />
                <MacroBar label="Grasas" value={gras} color="#A855F7" />
              </View>
            </View>
          </View>

          {/* Ingredientes */}
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>Ingredientes detectados</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {report.ingredientesDetectados.map((ing, index) => (
              <View key={index} style={{ backgroundColor: c.surface, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 0.5, borderColor: ratingColor + '40' }}>
                <Text style={{ fontSize: 13, color: ratingColor, fontFamily: 'PlusJakartaSans_500Medium' }}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Puntos clave */}
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, marginTop: 4 }}>3 puntos clave</Text>
          {report.puntosClave.map((point, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ratingColor, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' }}>{index + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 22 }}>{point}</Text>
            </View>
          ))}

          {/* Botones */}
          {consumoMsg ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.surfaceGreen, paddingVertical: 16, borderRadius: 14, borderWidth: 0.5, borderColor: c.borderGreen }}>
              <Ionicons name="checkmark-circle" size={20} color={c.green} />
              <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>{consumoMsg}</Text>
            </View>
          ) : (
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.background, borderWidth: 1.5, borderColor: c.green, paddingVertical: 16, borderRadius: 14 }} onPress={handleAddToDay}>
              <Ionicons name="add-circle-outline" size={20} color={c.green} />
              <Text style={{ color: c.green, fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Agregar a mi día</Text>
            </Pressable>
          )}

          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.surfaceGreen, borderWidth: 1.5, borderColor: c.green, paddingVertical: 14, borderRadius: 14 }} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={c.green} />
            <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Compartir resultado</Text>
          </Pressable>

          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ratingColor, paddingVertical: 16, borderRadius: 14 }} onPress={handleReset}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Fotografiar otro platillo</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
      <SafeAreaView style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Fotografiar platillo</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Encuadra tu platillo completo en la foto</Text>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 32, gap: 16, paddingHorizontal: 16 }}>
          {error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.15)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, width: '100%' }}>
              <Ionicons name="alert-circle-outline" size={18} color="#F87171" />
              <Text style={{ flex: 1, fontSize: 13, color: '#F87171' }}>{error}</Text>
            </View>
          )}
          {isAnalyzing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 }}>
              <ActivityIndicator size="small" color="#16A34A" />
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontFamily: 'PlusJakartaSans_500Medium' }}>Analizando platillo con IA...</Text>
            </View>
          ) : (
            <Pressable style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' }} onPress={handleTakePhoto}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' }} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({});
