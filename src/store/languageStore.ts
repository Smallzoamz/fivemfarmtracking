import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'th';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'th', // Default to Thai as requested implicitly by the nature of the server
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'fivem-farm-language',
    }
  )
);
