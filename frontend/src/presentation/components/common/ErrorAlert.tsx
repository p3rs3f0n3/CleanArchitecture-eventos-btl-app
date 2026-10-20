export function ErrorAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-left">
      {message}
    </div>
  );
}
