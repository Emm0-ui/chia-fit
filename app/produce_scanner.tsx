import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import Paywall from '@/app/components/paywall';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Share, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TODAS_LAS_OPCIONES } from '@/constants/produce-list';
import { analyzeProduce } from '@/lib/analyze-produce';
import { useColors } from '@/lib/theme';
import type { Madurez, ProduceReport } from '@/types/produce-report';

const MADUREZ_CONFIG: Record<Madurez, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  aun_no:     { label: 'Aún no',      color: '#0D9488', bg: 'rgba(13,148,136,0.1)',  border: 'rgba(13,148,136,0.3)',  emoji: '🟢' },
  perfecta:   { label: '¡Perfecta!',  color: '#16A34A', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)',   emoji: '✅' },
  comela_hoy: { label: 'Cómela hoy',  color: '#EA580C', bg: 'rgba(234,88,12,0.1)',   border: 'rgba(234,88,12,0.3)',   emoji: '🟠' },
  ya_paso:    { label: 'Ya pasó',     color: '#B45309', bg: 'rgba(180,83,9,0.1)',    border: 'rgba(180,83,9,0.3)',    emoji: '🟤' },
};

export default function ProduceScannerScreen() {
  const c = useColors();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ProduceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<{ base64: string; mediaType: 'image/jpeg' | 'image/png' } | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');

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
      setLastPhoto({ base64: photo.base64, mediaType });
      const result = await analyzeProduce(photo.base64, mediaType);
      setReport(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'LimitError') { setLimitReached(true); return; }
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCorregir = async (nombreCorrecto: string) => {
    if (!lastPhoto) return;
    setSelectorVisible(false);
    setBusqueda('');
    setIsAnalyzing(true);
    try {
      const result = await analyzeProduce(lastPhoto.base64, lastPhoto.mediaType, nombreCorrecto);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al re-analizar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const config = MADUREZ_CONFIG[report.madurez];
    const senales = report.senalesVisuales.map((s: string) => '• ' + s).join('\n');
    const texto = '🌿 Analicé esta fruta/verdura con ChIA Fit:\n\n' + config.emoji + ' ' + report.nombre + '\n📊 Estado: ' + config.label + '\n⏰ ' + report.diasParaConsumo + '\n\n🗒️ Señales visuales:\n' + senales + '\n🥗 Cómo conservarla:\n' + report.comoConservar + '\n\n¡Descarga ChIA Fit y analiza tus frutas y verduras! 🥦';
    await Share.share({ message: texto });
  };

  const handleReset = () => { setReport(null); setError(null); setLastPhoto(null); setBusqueda(''); setLimitReached(false); };

  const opcionesFiltradas = TODAS_LAS_OPCIONES.filter(op => op.toLowerCase().includes(busqueda.toLowerCase()));

  if (!fontsLoaded || !permission) {
    return <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.green} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }}>
        <Text style={{ fontSize: 64 }}>🍎</Text>
        <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Acceso a la cámara</Text>
        <Text style={{ fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>ChIA Fit necesita tu cámara para analizar frutas y verduras.</Text>
        <Pressable style={{ backgroundColor: c.green, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14 }} onPress={requestPermission}>
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Permitir cámara</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={{ color: c.textMuted, fontSize: 15 }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isAnalyzing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <ActivityIndicator size="large" color={c.green} />
        <Text style={{ fontSize: 15, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Analizando madurez con IA...</Text>
      </SafeAreaView>
    );
  }

  if (limitReached) {
    return <Paywall mensaje="Alcanzaste tus 20 escaneos gratuitos de este mes." onVolver={() => { setLimitReached(false); router.back(); }} />;
  }

  if (report) {
    const config = MADUREZ_CONFIG[report.madurez];
    const STAGES: Madurez[] = ['aun_no', 'perfecta', 'comela_hoy', 'ya_paso'];
    const currentIdx = STAGES.indexOf(report.madurez);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
              <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
            </Pressable>
            <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Análisis de madurez</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Nombre + corregir */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Text style={{ fontSize: 26, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, textAlign: 'center' }}>{report.nombre}</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 0.5, borderColor: c.border }} onPress={() => setSelectorVisible(true)}>
              <Ionicons name="pencil-outline" size={14} color={c.textMuted} />
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Corregir</Text>
            </Pressable>
          </View>

          {/* Hero madurez */}
          <View style={{ borderRadius: 20, borderWidth: 1.5, borderColor: config.border, backgroundColor: config.bg, padding: 24, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>{config.emoji}</Text>
            <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: config.color }}>{config.label}</Text>
            <Text style={{ fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>{report.diasParaConsumo}</Text>
          </View>

          {/* Escala visual */}
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textSecondary }}>Escala de madurez</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {STAGES.map((stage, idx) => {
                const cfg = MADUREZ_CONFIG[stage];
                const isActive = idx === currentIdx;
                const isPast = idx < currentIdx;
                return (
                  <View key={stage} style={{ alignItems: 'center', flex: 1, gap: 6 }}>
                    <View style={[{ width: isActive ? 44 : 36, height: isActive ? 44 : 36, borderRadius: isActive ? 22 : 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive || isPast ? cfg.color : c.surface, borderWidth: 0.5, borderColor: c.border }]}>
                      {isActive ? (
                        <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                      ) : (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isPast ? '#fff' : c.textDisabled }} />
                      )}
                    </View>
                    {idx < STAGES.length - 1 && (
                      <View style={{ position: 'absolute', top: isActive ? 22 : 18, left: '60%', right: '-60%', height: 3, backgroundColor: isPast ? cfg.color : c.border }} />
                    )}
                    <Text style={{ fontSize: 9, textAlign: 'center', color: isActive ? cfg.color : c.textMuted, fontFamily: isActive ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_400Regular' }}>{cfg.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Conservación */}
          <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: c.border }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Ionicons name="cube-outline" size={20} color={c.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textSecondary }}>Cómo conservarla</Text>
                <Text style={{ fontSize: 14, color: c.textMuted, marginTop: 4, lineHeight: 20 }}>{report.comoConservar}</Text>
              </View>
            </View>
          </View>

          {/* Señales visuales */}
          <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>Señales que observé</Text>
          {report.senalesVisuales.map((senal, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color, marginTop: 6, flexShrink: 0 }} />
              <Text style={{ flex: 1, fontSize: 14, color: c.textSecondary, lineHeight: 20 }}>{senal}</Text>
            </View>
          ))}

          {/* Botones */}
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.surfaceGreen, borderWidth: 1.5, borderColor: c.green, paddingVertical: 14, borderRadius: 14 }} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={c.green} />
            <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Compartir resultado</Text>
          </Pressable>

          <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: config.color, paddingVertical: 16, borderRadius: 14 }} onPress={handleReset}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Analizar otra fruta o verdura</Text>
          </Pressable>

        </ScrollView>

        {/* Modal selector */}
        <Modal visible={selectorVisible} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: c.border }}>
              <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>¿Cuál es la correcta?</Text>
              <Pressable onPress={() => { setSelectorVisible(false); setBusqueda(''); }}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 16, marginVertical: 12, borderWidth: 0.5, borderColor: c.border }}>
              <Ionicons name="search-outline" size={18} color={c.textMuted} />
              <TextInput style={{ flex: 1, fontSize: 15, color: c.textPrimary }} placeholder="Buscar fruta o verdura..." placeholderTextColor={c.textMuted} value={busqueda} onChangeText={setBusqueda} autoFocus />
            </View>
            <FlatList
              data={opcionesFiltradas}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              renderItem={({ item }) => (
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border }} onPress={() => handleCorregir(item)}>
                  <Text style={{ fontSize: 16, color: c.textPrimary, fontFamily: 'PlusJakartaSans_500Medium' }}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                </Pressable>
              )}
            />
          </SafeAreaView>
        </Modal>
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
          <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Analizar fruta o verdura</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>Enfoca la fruta o verdura completa</Text>
        </View>
        <View style={{ alignItems: 'center', paddingBottom: 32, gap: 16, paddingHorizontal: 16 }}>
          {error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.15)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, width: '100%' }}>
              <Ionicons name="alert-circle-outline" size={18} color="#F87171" />
              <Text style={{ flex: 1, fontSize: 13, color: '#F87171' }}>{error}</Text>
            </View>
          )}
          <Pressable style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' }} onPress={handleTakePhoto}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' }} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({});
