import { useUIStore } from "../../store/ui.store";

export function Topbar() {
  const { updatesAvailable, currentInstall } = useUIStore();

  const hasUpdates = updatesAvailable.length > 0;
  const isInstalling = currentInstall !== null;

  if (!hasUpdates && !isInstalling) return null;

  const updateLabel = hasUpdates
    ? `${updatesAvailable.length} update${updatesAvailable.length > 1 ? "s" : ""}: ${updatesAvailable.slice(0, 4).join(", ")}${updatesAvailable.length > 4 ? ", …" : ""}`
    : null;

  return (
    <div
      className="w-full h-[68px] rounded-xl flex items-center justify-between px-6 mb-6 shrink-0"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>
        {updateLabel}
      </p>

      {isInstalling && (
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-label="Installing"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeDasharray="40"
              strokeDashoffset="10"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm" style={{ color: "var(--foreground)" }}>
            installing: {currentInstall}
          </span>
        </div>
      )}
    </div>
  );
}
