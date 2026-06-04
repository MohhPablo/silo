export default function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center gap-6">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-surface">S</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wider">SILO</h1>
          <p className="text-xs text-text-tertiary tracking-widest uppercase">Budget Planner</p>
        </div>
      </div>

      <div className="w-8 h-8">
        <div className="w-full h-full border-2 border-text-tertiary border-t-accent rounded-full animate-spin" />
      </div>

      <p className="text-xs text-text-tertiary animate-pulse">Loading your data...</p>
    </div>
  );
}
