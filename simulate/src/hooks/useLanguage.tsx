import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.scheduler': 'Scheduler',
    'nav.data_structures': 'Data Structures',
    'header.title': 'The Clinical Editor',
    'header.subtitle': 'A high-precision environment for CPU scheduling analysis. Define process workloads, select architectural algorithms, and visualize execution flow with micro-second accuracy.',
    'sidebar.architecture': 'Selection Architecture',
    'sidebar.choose_algo': 'Choose your Algorithm',
    'sidebar.quantum': 'Time Quantum',
    'sidebar.workload': 'Process Workload',
    'sidebar.add': 'Add',
    'sidebar.random': 'Random',
    'sidebar.pid': 'PID',
    'sidebar.arrival': 'Arrival',
    'sidebar.burst': 'Burst',
    'sidebar.priority': 'Priority',
    'sidebar.wait': 'Wait',
    'sidebar.status': 'Status',
    'sidebar.no_processes': 'No processes added. Click Add or Random.',
    'timeline.execution': 'EXECUTION TIMELINE',
    'timeline.flow_map': 'Process Flow Map',
    'timeline.time_grid': 'Discrete Time Grid',
    'timeline.running': 'RUNNING',
    'timeline.idle': 'IDLE',
    'timeline.context_switch': 'CONTEXT SWITCH',
    'timeline.ready_queue': 'READY QUEUE',
    'timeline.currently_running': 'CURRENTLY RUNNING',
    'timeline.remaining': 'REMAINING',
    'timeline.cpu_idle': 'CPU IDLE',
    'timeline.no_simulation': 'NO ACTIVE SIMULATION',
    'timeline.event_log': 'LIVE EVENT LOG',
    'timeline.no_events': 'No events logged yet. Start the simulation to see events.',
    'stats.title': 'Simulation Statistics',
    'stats.avg_wait': 'Avg Waiting Time',
    'stats.avg_turnaround': 'Avg Turnaround Time',
    'stats.cpu_utilization': 'CPU Utilization',
    'stats.throughput': 'Throughput'
  },
  ar: {
    'nav.scheduler': 'المجدول',
    'nav.data_structures': 'هياكل البيانات',
    'header.title': 'المحرر السريري',
    'header.subtitle': 'بيئة عالية الدقة لتحليل جدولة المعالج. حدد أحمال العمل، واختر الخوارزميات، وراقب تدفق التنفيذ بدقة متناهية.',
    'sidebar.architecture': 'هيكلية الاختيار',
    'sidebar.choose_algo': 'اختر الخوارزمية',
    'sidebar.quantum': 'الكم الزمني',
    'sidebar.workload': 'حمولة العمل',
    'sidebar.add': 'إضافة',
    'sidebar.random': 'عشوائي',
    'sidebar.pid': 'المعرف',
    'sidebar.arrival': 'الوصول',
    'sidebar.burst': 'التنفيذ',
    'sidebar.priority': 'الأولوية',
    'sidebar.wait': 'الانتظار',
    'sidebar.status': 'الحالة',
    'sidebar.no_processes': 'لم يتم إضافة عمليات. اضغط إضافة أو عشوائي.',
    'timeline.execution': 'مخطط التنفيذ',
    'timeline.flow_map': 'خريطة تدفق العمليات',
    'timeline.time_grid': 'شبكة الوقت المنفصلة',
    'timeline.running': 'قيد التشغيل',
    'timeline.idle': 'خامل',
    'timeline.context_switch': 'تبديل السياق',
    'timeline.ready_queue': 'طابور الجاهزية',
    'timeline.currently_running': 'يعمل حالياً',
    'timeline.remaining': 'المتبقي',
    'timeline.cpu_idle': 'المعالج خامل',
    'timeline.no_simulation': 'لا يوجد محاكاة نشطة',
    'timeline.event_log': 'سجل الأحداث المباشر',
    'timeline.no_events': 'لا توجد أحداث مسجلة بعد. ابدأ المحاكاة لرؤية الأحداث.',
    'stats.title': 'إحصائيات المحاكاة',
    'stats.avg_wait': 'متوسط وقت الانتظار',
    'stats.avg_turnaround': 'متوسط وقت الاستجابة',
    'stats.cpu_utilization': 'استخدام المعالج',
    'stats.throughput': 'معدل الإنتاجية'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = sessionStorage.getItem('sim_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    sessionStorage.setItem('sim_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
