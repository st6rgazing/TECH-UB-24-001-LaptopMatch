"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Laptop } from "@/lib/types";

export function ModelCombobox({
  laptops,
  value,
  onSelect,
}: {
  laptops: Laptop[];
  value?: string;
  onSelect: (laptop: Laptop) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = laptops.find((l) => l.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Search for your laptop model"
          className="w-full justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selected ? selected.name : "Search make & model…"}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="e.g. MacBook Air, XPS 13…" />
          <CommandList>
            <CommandEmpty>No matching model found.</CommandEmpty>
            <CommandGroup>
              {laptops.map((laptop) => (
                <CommandItem
                  key={laptop.id}
                  value={`${laptop.brand} ${laptop.model} ${laptop.name}`}
                  onSelect={() => {
                    onSelect(laptop);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === laptop.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1">{laptop.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {laptop.releaseYear}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
