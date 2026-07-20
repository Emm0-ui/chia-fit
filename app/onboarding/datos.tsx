import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingScreen, SelectableCard } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useColors } from '@/lib/theme';
import type { Sexo } from '@/types/onboarding';

export default function DatosScreen() {
  const c = useColors();
  const { data, updateData } = useOnboarding();

  const isValid = !!data.sexo && data.edad.trim() !== '' && data.pesoKg.trim() !== '' && data.alturaCm.trim() !== '' && Number(data.edad) > 0 && Number(data.pesoKg) > 0 && Number(data.alturaCm) > 0;

  const inputStyle = { borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.textPrimary, backgroundColor: c.inputBg };
  const labelStyle = { fontSize: 13, color: c.textMuted, marginTop: 4 };

  return (
    <OnboardingScreen step={2} title="Datos personales" subtitle="Necesitamos esta información para personalizar tu plan" canProceed={isValid} onNext={() => router.push('/onboarding/condiciones')}>
      <Text style={labelStyle}>Sexo</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['hombre', 'mujer'] as Sexo[]).map((sexo) => (
          <View key={sexo} style={{ flex: 1 }}>
            <SelectableCard label={sexo === 'hombre' ? '👨 Hombre' : '👩 Mujer'} selected={data.sexo === sexo} onPress={() => updateData({ sexo })} />
          </View>
        ))}
      </View>
      <Text style={labelStyle}>Edad</Text>
      <TextInput style={inputStyle} value={data.edad} onChangeText={(edad) => updateData({ edad })} placeholder="Ej: 28" placeholderTextColor={c.textDisabled} keyboardType="number-pad" />
      <Text style={labelStyle}>Peso (kg)</Text>
      <TextInput style={inputStyle} value={data.pesoKg} onChangeText={(pesoKg) => updateData({ pesoKg })} placeholder="Ej: 70" placeholderTextColor={c.textDisabled} keyboardType="decimal-pad" />
      <Text style={labelStyle}>Altura (cm)</Text>
      <TextInput style={inputStyle} value={data.alturaCm} onChangeText={(alturaCm) => updateData({ alturaCm })} placeholder="Ej: 170" placeholderTextColor={c.textDisabled} keyboardType="number-pad" />
      <Text style={labelStyle}>Cintura (cm) <Text style={{ color: c.textDisabled }}>— opcional</Text></Text>
      <TextInput style={inputStyle} value={data.cinturaCm} onChangeText={(cinturaCm) => updateData({ cinturaCm })} placeholder="Ej: 85" placeholderTextColor={c.textDisabled} keyboardType="decimal-pad" />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({});
