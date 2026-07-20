import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { OnboardingScreen, SelectableCard } from '@/components/onboarding/onboarding-screen';
import { useOnboarding } from '@/contexts/onboarding-context';
import { requestNotificationPermission, scheduleDailyExerciseReminder, scheduleDailyWaterReminder, scheduleWeeklyWeightReminder } from '@/lib/notifications';
import { saveOnboardingToProfile } from '@/lib/save-onboarding';
import type { Presupuesto } from '@/types/onboarding';

const OPTIONS: { value: Presupuesto; label: string }[] = [
  { value: 'economico', label: '🛒 Económico (menos de $800 pesos)' },
  { value: 'moderado', label: '🧺 Moderado ($800 - $1,300 pesos)' },
  { value: 'sin_limite', label: '✨ Holgado (más de $1,300 pesos)' },
];

export default function PresupuestoScreen() {
  const { data, updateData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!data.presupuesto) return;
    setIsLoading(true);
    try {
      await saveOnboardingToProfile(data);
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleWeeklyWeightReminder();
        await scheduleDailyExerciseReminder();
        await scheduleDailyWaterReminder();
      }
      router.replace('/plan');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar tu información');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingScreen step={6} title="Presupuesto semanal" subtitle="¿Cuánto puedes invertir en alimentación cada semana?" canProceed={!!data.presupuesto} onNext={handleFinish} nextLabel="Generar mi plan" isLoading={isLoading}>
      {OPTIONS.map((option) => (
        <SelectableCard key={option.value} label={option.label} selected={data.presupuesto === option.value} onPress={() => updateData({ presupuesto: option.value })} />
      ))}
    </OnboardingScreen>
  );
}
