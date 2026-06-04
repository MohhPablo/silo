export default function Header({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border-light pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-between px-5 h-12">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary select-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-secondary -mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
