// Shared card layout used by the Login and Register pages
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
            R
          </div>
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <p className="text-center text-sm text-slate-500 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
