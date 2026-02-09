export default function LoadingSpinner({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full" />
      <p className="text-gray-600 mt-4 text-sm">{text}</p>
    </div>
  );
}
