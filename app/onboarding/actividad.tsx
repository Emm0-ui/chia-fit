import { router } from 'expo-router';
import { OnboardingScreen, SelectableCard } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import type { NivelActividad } from '@/types/onboarding';

const OPTIONS: { value: NivelActividad; label: string }[] = [
  { value: 'sedentario', label: '🪑 Sedentario' },
  { value: 'ligero', label: '🚶 Ligero (1-3 días/semana)' },
  { value: 'moderado', label: '🏃 Moderado (3-5 días/semana)' },
  { value: 'activo', label: '💪 Activo (6-7 días/semana)' },
];

export default function ActividadScreen() {
  const { data, updateData } = useOnboarding();
  return (
    <OnboardingScreen step={4} title="Nivel de actividad" subtitle="¿Con qué frecuencia haces ejercicio?" canProceed={!!data.actividad} onNext={() => router.push('/onboarding/comidas')}>
      {OPTIONS.map((option) => (
        <SelectableCard key={option.value} label={option.label} selected={data.actividad === option.value} onPress={() => updateData({ actividad: option.value })} />
      ))}
    </OnboardingScreen>
  );
}
