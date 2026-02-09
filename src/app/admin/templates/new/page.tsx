import TemplateConfigurator from '@/components/templates/TemplateConfigurator';

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau modèle</h1>
        <p className="text-gray-500 mt-1">Définissez la structure de section de votre modèle</p>
      </div>
      <TemplateConfigurator />
    </div>
  );
}
