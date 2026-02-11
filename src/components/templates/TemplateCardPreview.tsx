'use client';

import type { PageTemplate, SectionType } from '@/types/database';

export const TEMPLATE_PREVIEW_DEFAULTS: Record<SectionType, string> = {
  hero: '<div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4 text-center rounded-xl"><h1 class="text-2xl font-bold mb-2">Titre Principal</h1><p class="text-sm opacity-90">Description accrocheur</p></div>',
  rich_text: '<div class="p-4"><h2 class="text-lg font-bold mb-2">Titre de section</h2><p class="text-gray-600 text-sm">Contenu texte ici.</p></div>',
  image_text: '<div class="flex gap-4 items-center p-4"><div class="w-1/2 bg-gray-200 rounded-lg h-20"></div><div class="w-1/2"><h2 class="text-lg font-bold mb-1">Titre</h2><p class="text-gray-600 text-xs">Description</p></div></div>',
  cta: '<div class="bg-gray-900 text-white py-8 px-4 text-center rounded-xl"><h2 class="text-xl font-bold mb-2">Pret a commencer ?</h2><span class="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">Demarrer</span></div>',
  faq: '<div class="p-4 space-y-2"><h2 class="text-lg font-bold mb-2">FAQ</h2><div class="border border-gray-200 rounded-lg p-2"><p class="font-semibold text-sm">Question 1 ?</p></div><div class="border border-gray-200 rounded-lg p-2"><p class="font-semibold text-sm">Question 2 ?</p></div></div>',
  testimonials: '<div class="grid grid-cols-2 gap-2 p-4"><div class="bg-gray-50 p-3 rounded-lg"><p class="text-gray-600 italic text-xs">"Excellent !"</p><p class="mt-1 font-semibold text-xs">- Client</p></div><div class="bg-gray-50 p-3 rounded-lg"><p class="text-gray-600 italic text-xs">"Remarquable."</p><p class="mt-1 font-semibold text-xs">- Client</p></div></div>',
  gallery: '<div class="grid grid-cols-3 gap-2 p-4"><div class="bg-gray-200 rounded-lg h-12"></div><div class="bg-gray-200 rounded-lg h-12"></div><div class="bg-gray-200 rounded-lg h-12"></div></div>',
  features: '<div class="grid grid-cols-3 gap-3 p-4"><div class="text-center"><div class="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 1</p></div><div class="text-center"><div class="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 2</p></div><div class="text-center"><div class="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 3</p></div></div>',
  stats: '<div class="grid grid-cols-4 gap-2 text-center p-4"><div><p class="text-lg font-bold text-blue-600">99%</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-green-600">10K+</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-purple-600">50+</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-amber-600">24/7</p><p class="text-gray-500 text-xs">Stat</p></div></div>',
  contact: '<div class="p-4 text-center"><h2 class="text-lg font-bold mb-2">Contact</h2><div class="space-y-1"><div class="h-6 bg-gray-100 rounded"></div><div class="h-6 bg-gray-100 rounded"></div></div></div>',
};

export default function TemplateCardPreview({ template }: { template: PageTemplate }) {
  const srcdoc = `<!DOCTYPE html>
<html><head>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;margin:0;padding:0;overflow:hidden;}</style>
</head><body>
  ${template.sections.map((s) => TEMPLATE_PREVIEW_DEFAULTS[s.type] || '').join('')}
</body></html>`;

  return (
    <div className="h-36 overflow-hidden border-b border-gray-100 bg-gray-50 relative">
      <iframe
        className="w-full border-0 pointer-events-none"
        style={{ height: '300px', transform: 'scale(0.48)', transformOrigin: 'top left', width: '208%' }}
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        title={`Apercu ${template.name}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
    </div>
  );
}
