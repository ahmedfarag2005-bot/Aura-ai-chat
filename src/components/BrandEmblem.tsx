import React from 'react';

interface BrandEmblemProps {
  className?: string;
  size?: number;
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = '',
  size = 88,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none bg-transparent ${className}`}
      style={{ width: size, height: size }}
    >
      {/* SVG Icon with 100% transparent background, adapting seamlessly to whatever background is behind it */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* الشريط الجانبي الأيسر: شريط منحني وديناميكي باللون البرتقالي المحروق (Terracotta) */}
        <path
          d="M16 86 C14 62 20 40 34 26 C28 42 24 64 28 82 C23 85 18 86 16 86 Z"
          fill="#C85A32"
        />

        {/* الشريط الجانبي الأيمن: شريط منحني وديناميكي باللون البرتقالي المحروق (Terracotta) */}
        <path
          d="M65 82 C74 62 79 40 85 18 C83 36 78 58 68 76 C66 79 64 82 65 82 Z"
          fill="#D45D36"
        />

        {/* العنصر المركزي: شكل منحني وسلس باللون الأصفر الخردلي الفاتح يشبه حرف "P" أو حرف "م"
            مع تفريغ حقيقي للحلقة الداخلية (fillRule="evenodd") ليظهر ما خلفه تماماً */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37 80 L37 26 C37 23 41 20 46 20 C58 19 69 25 69 38 C69 50 58 55 47 55 L47 80 Z M47 30 C47 27 52 25 58 28 C62 30 62 37 60 42 C56 46 48 45 47 42 Z"
          fill="#E9BA4C"
        />

        {/* الرمز العلوي: انفجار شعاعي / شمس مصغرة باللون البرتقالي بخطوط دقيقة */}
        <g transform="translate(83, 17)">
          <circle cx="0" cy="0" r="2.5" fill="#E06338" />
          <line x1="0" y1="-6.5" x2="0" y2="-3.2" stroke="#E06338" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="0" y1="3.2" x2="0" y2="6.5" stroke="#E06338" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="-6.5" y1="0" x2="-3.2" y2="0" stroke="#E06338" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="3.2" y1="0" x2="6.5" y2="0" stroke="#E06338" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="-4.6" y1="-4.6" x2="-2.4" y2="-2.4" stroke="#E06338" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="2.4" y1="2.4" x2="4.6" y2="4.6" stroke="#E06338" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="4.6" y1="-4.6" x2="2.4" y2="-2.4" stroke="#E06338" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="-2.4" y1="2.4" x2="-4.6" y2="4.6" stroke="#E06338" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
