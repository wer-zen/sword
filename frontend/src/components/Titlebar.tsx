import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export default function Titlebar() {
  return (
    <div
      data-tauri-drag-region
      style={{
        height: "32px",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        userSelect: "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <span style={{ fontSize: "12px", color: "#555", fontWeight: 500 }}>
        sword
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => appWindow.minimize()} style={btnStyle}>─</button>
        <button onClick={() => appWindow.toggleMaximize()} style={btnStyle}>□</button>
        <button
          onClick={() => appWindow.close()}
          style={{ ...btnStyle, color: "#ff5f57" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#666",
  cursor: "pointer",
  fontSize: "12px",
  padding: "2px 6px",
  borderRadius: "4px",
  lineHeight: 1,
};
