import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { MultiSelectItem } from "./multi-select";


interface MultiSelectProps {
  items: MultiSelectItem[];
  selectedItems: MultiSelectItem[]; 
  onSelect: (selectedItems: MultiSelectItem[]) => void;
}

export function MultiInput({ items, selectedItems, onSelect }: MultiSelectProps) {

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<MultiSelectItem[]>(selectedItems);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const handleUnselect = (item: MultiSelectItem) => {
    setSelected(prev => prev.filter(s => s.value !== item.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          setSelected(prev => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
      }

      if (e.key === "Enter" && inputValue.trim() !== "") {
        const newItem = { value: inputValue, label: inputValue }; // Create a new item
        setSelected(prev => [...prev, newItem]);
        setInputValue("");
      }

      if (e.key === "Escape") {
        input.blur();
      }
    }
  };

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
    <div
      className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    >
      <div className="flex gap-1 flex-wrap">
        {selected.map((framework) => {
          return (
            <Badge key={framework.value} variant="secondary">
              {framework.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(framework);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(framework)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          )
        })}
        {/* Avoid having the "Search" Icon */}
        <CommandPrimitive.Input
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
        />
      </div>
    </div>
  </Command >
  );
}