import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

export default function RegisterScreen() {
  const c = useColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('Completa todos los campos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setError(null);
    setIsLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
    if (signUpError) { setIsLoading(false); setError(signUpError.message); return; }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, name: name.trim(), email: email.trim() });
      if (profileError) { setIsLoading(false); setError(profileError.message); return; }
    }
    setIsLoading(false);
    if (data.session) { router.replace('/(tabs)'); return; }
    router.replace('/auth/login');
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 32, paddingVertical: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 40, fontFamily: 'PlusJakartaSans_700Bold', color: c.textPrimary, letterSpacing: -1 }}>ChIA Fit 🌿</Text>
            <Text style={{ fontSize: 16, color: c.textMuted, fontFamily: 'PlusJakartaSans_400Regular' }}>Crea tu cuenta</Text>
          </View>

          <View style={{ gap: 12 }}>
            {[
              { label: 'Nombre', value: name, onChange: setName, placeholder: 'Tu nombre', type: 'default' as const, capitalize: 'words' as const },
              { label: 'Email', value: email, onChange: setEmail, placeholder: 'tu@email.com', type: 'email-address' as const, capitalize: 'none' as const },
              { label: 'Contraseña', value: password, onChange: setPassword, placeholder: 'Mínimo 6 caracteres', type: 'default' as const, capitalize: 'none' as const, secure: true },
            ].map((field) => (
              <View key={field.label}>
                <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted, marginBottom: 6, marginTop: 4 }}>{field.label}</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: c.inputBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.textPrimary, backgroundColor: c.inputBg, fontFamily: 'PlusJakartaSans_400Regular' }}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor={c.textDisabled}
                  keyboardType={field.type}
                  autoCapitalize={field.capitalize}
                  autoCorrect={false}
                  secureTextEntry={field.secure}
                />
              </View>
            ))}

            {error && (
              <View style={{ backgroundColor: c.errorBg, padding: 12, borderRadius: 10 }}>
                <Text style={{ fontSize: 13, color: c.errorText, fontFamily: 'PlusJakartaSans_500Medium' }}>{error}</Text>
              </View>
            )}

            <Pressable style={({ pressed }) => [{ backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, opacity: pressed ? 0.9 : 1 }]} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Crear cuenta</Text>}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: c.textMuted, fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular' }}>¿Ya tienes cuenta?</Text>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text style={{ color: c.green, fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Inicia sesión</Text>
              </Pressable>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
