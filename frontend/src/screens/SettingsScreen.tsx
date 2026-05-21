import { Sun, Moon } from "lucide-react";
import { useUIStore } from "../store/ui.store";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-xl"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        {description && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {description}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsScreen() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Settings
      </h2>

      <section className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest px-1" style={{ color: "var(--muted)" }}>
          Appearance
        </p>

        <SettingRow
          label="Theme"
          description={theme === "dark" ? "Dark mode active" : "Light mode active"}
        >
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--surface-secondary)",
              color: "var(--foreground)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </SettingRow>
      </section>
    </div>
  );
}
