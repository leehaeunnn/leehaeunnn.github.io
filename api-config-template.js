// API Configuration Template
// GitHub Actions will replace PLACEHOLDER with actual API key
// Supports multiple API services
const API_CONFIG = {
  GEMINI_API_KEY: 'GEMINI_API_KEY_PLACEHOLDER',
  // Future API keys can be added here
  // GITHUB_TOKEN: 'GITHUB_TOKEN_PLACEHOLDER',
  // SUPABASE_KEY: 'SUPABASE_KEY_PLACEHOLDER'
};

// API endpoints configuration
const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models',
  GITHUB: 'https://api.github.com',
  SUPABASE: 'https://xvjdqubiukqspucnvjyg.supabase.co'
};

// Model configurations
const MODEL_CONFIG = {
  GEMINI_CHAT: 'gemini-2.5-flash',
  GEMINI_VISION: 'gemini-2.5-flash',
  GEMINI_PRO: 'gemini-1.5-pro'
};