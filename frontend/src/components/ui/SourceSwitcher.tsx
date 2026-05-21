import { Select, ListBox } from "@heroui/react";
import { AppEntry } from "../../types/app";
import { useAppSources } from "../../hooks/useAppSources";

export function SourceSwitcher({ entry }: { entry: AppEntry }) {
  const { activeSource, allSources, setSource } = useAppSources(entry);

  if (allSources.length <= 1) return null;

  return (
    <Select
      variant="secondary"
      selectedKey={activeSource.id}
      onSelectionChange={(key) => {
        if (key != null) setSource(String(key));
      }}
      className="min-w-0 flex-1"
      aria-label="Select source"
    >
      <Select.Trigger className="text-sm overflow-hidden rounded-full" style={{ color: "var(--foreground)" }}>
        <Select.Value className="truncate min-w-0" />
        <Select.Indicator className="shrink-0" />
      </Select.Trigger>
      <Select.Popover>
        <ListBox aria-label="Sources">
          {allSources.map((src) => (
            <ListBox.Item
              key={src.id}
              id={src.id}
              textValue={`${src.type} ${src.version}`}
            >
              {src.type} {src.version}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
