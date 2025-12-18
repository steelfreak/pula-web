
"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/lib/stores";
import Spinner from "./spinner";
import { Tooltip } from "@/components/ui/tooltip-info";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  span?: string;
  excludedLanguages?: string[];
}

export default function LanguageSelect({
  value,
  onChange,
  placeholder = "Select language",
  label,
  span,
  excludedLanguages = [],
}: LanguageSelectProps) {
  const [open, setOpen] = React.useState(false);
  const { languages, loading, error } = useLanguageStore();

  // Filter languages based on excluded languages
  const filteredLanguages = languages.filter(
    (language) => !excludedLanguages.includes(language.lang_code)
  );

  const selectedLanguage = languages.find((lang) => lang.lang_code === value);

  return (
    <div>

      <div className=" flex items-center">
        {label && (
          <>
            <label
              className="block text-sm font-medium"
              style={{ color: "#222222" }}
            >
              {label}
            </label>
            {span && <span className="text-sm text-red-500 ml-1">{span}</span>}
            <Spinner loading={loading} />
            {/* Add helpful tooltips for each language type */}
            {label === "Source Language" && (
              <Tooltip description="The language you want to translate from. Select the language of the word or term you're searching for." />
            )}
            {label?.includes("Target Language") && (
              <Tooltip description="The language you want to translate to. Select one or more languages to see translations and contributions." />
            )}
          </>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white font-normal"
            style={{
              borderColor: "#a2a9b1",
              color: value ? "#222222" : "#72777d",
            }}
          >
            {selectedLanguage ? selectedLanguage.lang_label : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search language..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {filteredLanguages.map((language) => (
                  <CommandItem
                    key={language.lang_code}
                    value={language.lang_label}
                    onSelect={() => {
                      onChange(language.lang_code);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === language.lang_code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {language.lang_label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
