// File: src/context/LanguageContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from '../data/translations'; // Trỏ đúng đường dẫn file bộ từ điển ở Bước 1

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void; // <--- CHÍNH LÀ DÒNG NÀY NÀY
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Mặc định cho tiếng Việt, nếu thích mày có thể lưu vào localStorage để nhớ ngôn ngữ
  const [language, setLanguage] = useState<Language>('vi');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  // Hàm t (translate) thần thánh để móc dữ liệu từ từ điển
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Nếu quên chưa khai báo trong từ điển, nó sẽ hiện luôn cái key để mày biết mà sửa
      }
    }
    return value as string;
  };

  return (
   <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook để dùng trong các components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage phải được đặt trong LanguageProvider');
  return context;
};