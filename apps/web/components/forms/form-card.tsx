import Link from "next/link";
import { formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  BarChart3,
} from "lucide-react";

interface FormCardProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    status: "draft" | "published" | "archived";
    visibility: "public" | "unlisted";
    createdAt: Date | null;
  };
  responseCount?: number;
  onEdit: (formId: string) => void;
  onDelete: (formId: string) => void;
  onClone: (formId: string) => void;
  onTogglePublish: (formId: string, currentStatus: string) => void;
}

export function FormCard({
  form,
  responseCount = 0,
  onEdit,
  onDelete,
  onClone,
  onTogglePublish,
}: FormCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="line-clamp-1">{form.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {form.description || "No description"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(form.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/forms/${form.id}/responses`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Responses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/forms/${form.id}/analytics`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTogglePublish(form.id, form.status)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {form.status === "published" ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone(form.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(form.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                form.status === "published"
                  ? "default"
                  : form.status === "draft"
                  ? "secondary"
                  : "outline"
              }
            >
              {form.status}
            </Badge>
            <Badge variant="outline">{form.visibility}</Badge>
          </div>
          <div className="text-muted-foreground">
            {responseCount} responses
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {formatDate(form.createdAt)}</span>
          {form.status === "published" && (
            <Link
              href={`/f/${form.slug}`}
              target="_blank"
              className="text-primary hover:underline flex items-center gap-1"
            >
              View form <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}