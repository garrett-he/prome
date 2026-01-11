import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en/translation.json";
import zh from "./resources/zh/translation.json";

export type Language = "en" | "zh";

export function detectSystemLanguage(): Language {
    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function isLanguage(value: string): value is Language {
    return value === "en" || value === "zh";
}

void i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        zh: { translation: zh },
    },
    lng: detectSystemLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
