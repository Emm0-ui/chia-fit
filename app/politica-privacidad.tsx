import { PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/lib/theme';

export default function PoliticaPrivacidadScreen() {
  const c = useColors();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) return null;

  const SECCIONES = [
    {
      titulo: '1. Información que recopilamos',
      texto: 'ChIA Fit recopila información que tú proporcionas directamente: nombre, email, datos corporales (peso, altura, cintura), objetivo de salud, nivel de actividad, condiciones médicas y alergias. También recopilamos datos de uso como alimentos escaneados, registros de peso y hábitos de hidratación.',
    },
    {
      titulo: '2. Cómo usamos tu información',
      texto: 'Usamos tu información exclusivamente para generar tu plan nutricional personalizado, analizar tu progreso, y mejorar las recomendaciones de la app. No vendemos ni compartimos tu información personal con terceros con fines comerciales.',
    },
    {
      titulo: '3. Almacenamiento y seguridad',
      texto: 'Tu información se almacena de forma segura en servidores de Supabase con cifrado en tránsito y en reposo. Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos contra acceso no autorizado.',
    },
    {
      titulo: '4. Inteligencia Artificial',
      texto: 'Los análisis nutricionales son generados por modelos de IA (Claude de Anthropic). Las imágenes que fotografías se procesan para el análisis y no se almacenan permanentemente. Los resultados son estimaciones informativas y no constituyen consejo médico.',
    },
    {
      titulo: '5. Tus derechos',
      texto: 'Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Puedes exportar tus datos desde la sección de Perfil o solicitar la eliminación de tu cuenta directamente en la app.',
    },
    {
      titulo: '6. Retención de datos',
      texto: 'Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos personales se eliminan permanentemente de nuestros servidores en un plazo máximo de 30 días.',
    },
    {
      titulo: '7. Contacto',
      texto: 'Si tienes preguntas sobre esta política de privacidad o el manejo de tus datos, puedes contactarnos a través de la app o escribirnos directamente.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Política de privacidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: c.surfaceGreen, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: c.borderGreen }}>
          <Text style={{ fontSize: 13, color: c.green, fontFamily: 'PlusJakartaSans_500Medium', lineHeight: 20 }}>
            Última actualización: Julio 2026. Esta política describe cómo ChIA Fit recopila, usa y protege tu información personal.
          </Text>
        </View>

        {SECCIONES.map((seccion, i) => (
          <View key={i} style={{ backgroundColor: c.surface, borderRadius: 14, padding: 16, gap: 8, borderWidth: 0.5, borderColor: c.border }}>
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary }}>{seccion.titulo}</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, lineHeight: 20 }}>{seccion.texto}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 12, color: c.textDisabled, textAlign: 'center' }}>
          ChIA Fit · Hecho con 🌿 en México
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
