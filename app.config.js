const path = require('path');
const { loadProjectEnv } = require('@expo/env');

loadProjectEnv(path.resolve(__dirname));

const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const baseConfig = config ?? appJson.expo;

  return {
    ...baseConfig,
    extra: {
      ...baseConfig.extra,
      anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
};
