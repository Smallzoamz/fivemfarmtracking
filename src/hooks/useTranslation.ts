import { useLanguageStore } from '@/store/languageStore';
import { en } from '@/locales/en';
import { th } from '@/locales/th';

const dict = { en, th };

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const t = (key: keyof typeof en, ...args: any[]) => {
    let value = dict[language][key] || key;
    if (args.length > 0) {
      if (typeof args[0] === 'object' && args[0] !== null) {
        // Handle object params like {current: 1, target: 11}
        const params = args[0];
        Object.keys(params).forEach(k => {
          value = value.replace(`{${k}}`, String(params[k]));
        });
      } else {
        // Handle positional params like {0}
        args.forEach((arg, i) => {
          value = value.replace(`{${i}}`, String(arg));
        });
      }
    }
    return value;
  };

  return { t, language, setLanguage };
}
