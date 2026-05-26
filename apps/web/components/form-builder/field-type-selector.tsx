"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Plus,
  Type,
  AlignLeft,
  Mail,
  Hash,
  ListChecks,
  CheckSquare,
  Star,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface FieldTypeSelectorProps {
  onSelectType: (type: string) => void;
}

const fieldTypes = [
  { value: "short_text", label: "Short Text", icon: Type },
  { value: "long_text", label: "Long Text", icon: AlignLeft },
  { value: "email", label: "Email", icon: Mail },
  { value: "number", label: "Number", icon: Hash },
  { value: "single_select", label: "Single Select", icon: CheckSquare },
  { value: "multi_select", label: "Multi Select", icon: ListChecks },
  { value: "dropdown", label: "Dropdown", icon: ChevronDown },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "rating", label: "Rating", icon: Star },
  { value: "date", label: "Date", icon: Calendar },
];

export function FieldTypeSelector({ onSelectType }: FieldTypeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Field Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {fieldTypes.map((type) => {
            const Icon = type.icon;
            return (
              <DropdownMenuItem
                key={type.value}
                onClick={() => onSelectType(type.value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{type.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}