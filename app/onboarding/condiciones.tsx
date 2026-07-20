import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { OnboardingScreen, SelectableChip } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useColors } from '@/lib/theme';
import type { Alergia, Condicion } from '@/types/onboarding';

const CONDICIONES: { value: Condicion; label: string }[] = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol_alto', label: 'Colesterol alto' },
  { value: 'embarazo', label: 'Embarazo' },
  { value: 'vegano_vegetariano', label: 'Vegano/Vegetariano' },
  { value: 'intolerancia_gluten', label: 'Intolerancia al gluten' },
];

const ALERGIAS: { value: Alergia; label: string }[] = [
  { value: 'nueces', label: 'Nueces' },
  { value: 'mariscos', label: 'Mariscos' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'huevo', label: 'Huevo' },
  { value: 'soya', label: 'Soya' },
  { value: 'trigo', label: 'Trigo' },
  { value: 'otra', label: 'Otra' },
];

export default function CondicionesScreen() {
  const c = useColors();
  const { data, updateData } = useOnboarding();

  const toggleCondicion = (value: Condicion) => {
    if (value === 'ninguna') { updateData({ condiciones: ['ninguna'] }); return; }
    const withoutNinguna = data.condiciones.filter((c) => c !== 'ninguna');
    const exists = withoutNinguna.includes(value);
    const next = exists ? withoutNinguna.filter((c) => c !== value) : [...withoutNinguna, value];
    updateData({ condiciones: next.length === 0 ? ['ninguna'] : next });
  };

  const toggleAlergia = (value: Alergia) => {
    const exists = data.alergias.includes(value);
    const next = exists ? data.alergias.filter((a) => a !== value) : [...data.alergias, value];
    updateData({ alergias: next, alergiaOtra: value === 'otra' && exists ? '' : data.alergiaOtra });
  };

  return (
    <OnboardingScreen step={3} title="Condiciones y alergias" subtitle="Selecciona todo lo que aplique para adaptar tu plan" canProceed={data.condiciones.length > 0} onNext={() => router.push('/onboarding/actividad')}>
      <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 4 }}>Condiciones</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {CONDICIONES.map((item) => (
          <SelectableChip key={item.value} label={item.label} selected={data.condiciones.includes(item.value)} onPress={() => toggleCondicion(item.value)} />
        ))}
      </View>
      <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>Alergias</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ALERGIAS.map((item) => (
          <SelectableChip key={item.value} label={item.label} selected={data.alergias.includes(item.value)} onPress={() => toggleAlergia(item.value)} />
        ))}
      </View>
      {data.alergias.includes('otra') && (
        <TextInput style={{ borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.textPrimary, backgroundColor: c.inputBg, marginTop: 4 }} value={data.alergiaOtra} onChangeText={(alergiaOtra) => updateData({ alergiaOtra })} placeholder="Describe tu alergia" placeholderTextColor={c.textDisabled} />
      )}
    </OnboardingScreen>
  );
}
