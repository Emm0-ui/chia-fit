import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/lib/theme';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function EditarPerfilScreen() {
  const c = useColors();
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }
    const { data: profile } = await supabase.from('profiles').select('onboarding_data').eq('id', user.id).single();
    if (profile?.onboarding_data?.nombre) setNombre(profile.onboarding_data.nombre);
    if (profile?.onboarding_data?.foto_url) setFotoUrl(profile.onboarding_data.foto_url);
    setIsLoading(false);
  };

  const handleSeleccionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar tu foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const fileName = user.id + '_avatar.jpg';
      await supabase.storage.from('avatars').upload(fileName, decode(asset.base64), { contentType: 'image/jpeg', upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFotoUrl(publicUrl);
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const fileName = user.id + '_avatar.jpg';
      await supabase.storage.from('avatars').upload(fileName, decode(asset.base64), { contentType: 'image/jpeg', upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFotoUrl(publicUrl);
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la foto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío.'); return; }
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('onboarding_data').eq('id', user.id).single();
      const onboardingActual = profile?.onboarding_data ?? {};
      await supabase.from('profiles').update({
        onboarding_data: { ...onboardingActual, nombre: nombre.trim(), foto_url: fotoUrl }
      }).eq('id', user.id);
      Alert.alert('Guardado', 'Tu perfil se actualizó correctamente.');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size='large' color={c.green} />
      </SafeAreaView>
    );
  }

  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.backButton, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} color={c.backButtonIcon} />
        </Pressable>
        <Text style={{ fontSize: 17, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textPrimary }}>Editar perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, alignItems: 'center' }} showsVerticalScrollIndicator={false}>

        <View style={{ alignItems: 'center', gap: 16 }}>
          <View style={{ position: 'relative' }}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={{ width: 100, height: 100, borderRadius: 28, backgroundColor: c.surface }} />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 28, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 40, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff' }}>{inicial}</Text>
              </View>
            )}
            {isSaving && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color='#fff' />
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 0.5, borderColor: c.border }} onPress={handleSeleccionarFoto}>
              <Ionicons name='images-outline' size={16} color={c.textMuted} />
              <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Galería</Text>
            </Pressable>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 0.5, borderColor: c.border }} onPress={handleTomarFoto}>
              <Ionicons name='camera-outline' size={16} color={c.textMuted} />
              <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: 'PlusJakartaSans_500Medium' }}>Cámara</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ width: '100%', gap: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: c.textMuted }}>Nombre</Text>
          <TextInput
            style={{ backgroundColor: c.inputBg, borderRadius: 12, padding: 16, fontSize: 16, color: c.textPrimary, borderWidth: 1, borderColor: c.inputBorder, fontFamily: 'PlusJakartaSans_400Regular', width: '100%' }}
            value={nombre}
            onChangeText={setNombre}
            placeholder='Tu nombre'
            placeholderTextColor={c.textDisabled}
            autoCapitalize='words'
          />
        </View>

        <Pressable style={{ backgroundColor: c.green, paddingVertical: 16, borderRadius: 14, alignItems: 'center', width: '100%', opacity: isSaving ? 0.7 : 1 }} onPress={handleGuardar} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color='#fff' /> : <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Guardar cambios</Text>}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
