import Constants from 'expo-constants';

export function getAnthropicApiKey(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.anthropicApiKey;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }

  const fromEnv = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }

  return undefined;
}
