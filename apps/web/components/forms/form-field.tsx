"use client";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { CalendarIcon, Star } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

interface FormFieldProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder: string | null;
    description: string | null;
    required: boolean | null;
    options: any;
    validations: any;
  };
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const [date, setDate] = useState<Date>();

  const renderField = () => {
    switch (field.type) {
      case "short_text":
        return (
          <Input
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={error ? "border-destructive" : ""}
          />
        );

      case "long_text":
        return (
          <Textarea
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className={error ? "border-destructive" : ""}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            placeholder={field.placeholder || "your@email.com"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={error ? "border-destructive" : ""}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || "0"}
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.validations?.min}
            max={field.validations?.max}
            className={error ? "border-destructive" : ""}
          />
        );

      case "single_select":
        return (
          <RadioGroup value={value || ""} onValueChange={onChange}>
            <div className="space-y-3">
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multi_select":
        return (
          <div className="space-y-3">
            {field.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = value || [];
                    if (checked) {
                      onChange([...current, option.value]);
                    } else {
                      onChange(current.filter((v: any) => v !== option.value));
                    }
                  }}
                />
                <Label
                  htmlFor={option.value}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {field.label}
            </Label>
          </div>
        );

      case "dropdown":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "rating":
        const maxRating = field.validations?.max || 5;
        return (
          <div className="flex items-center gap-2">
            {[...Array(maxRating)].map((_, index) => {
              const rating = index + 1;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onChange(rating)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      rating <= (value || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    )}
                  />
                </button>
              );
            })}
            {value && (
              <span className="ml-2 text-sm text-muted-foreground">
                {value} / {maxRating}
              </span>
            )}
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  error && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  onChange(newDate ? format(newDate, "yyyy-MM-dd") : "");
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return (
          <Input
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {field.type !== "checkbox" && (
        <Label className="text-base">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {renderField()}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}