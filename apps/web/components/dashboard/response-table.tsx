"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { formatDateTime, truncate } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";

interface Response {
  id: string;
  formId: string;
  respondentEmail: string | null;
  respondentIp: string | null;
  userAgent: string | null;
  answers?: any;
  submittedAt: Date | string | null;
  metadata?: any;
}

interface Field {
  id: string;
  label: string;
  type: string;
}

interface ResponseTableProps {
  responses: Response[];
  fields: Field[];
  onDelete: (responseId: string) => void;
  isDeleting?: boolean;
}

export function ResponseTable({
  responses,
  fields,
  onDelete,
  isDeleting,
}: ResponseTableProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(
    null
  );

  const getAnswerValue = (answers: any, fieldId: string) => {
    const answerArray = Array.isArray(answers) ? answers : [];
    const answer = answerArray.find((a: any) => a.fieldId === fieldId);
    
    if (!answer) return "—";
    
    const value = answer.value;
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    
    return value?.toString() || "—";
  };

  const renderAnswerPreview = (answers: any) => {
    const answerArray = Array.isArray(answers) ? answers : [];
    if (answerArray.length === 0) return "No answers";
    
    const firstAnswer = answerArray[0];
    const value = firstAnswer?.value;
    
    if (Array.isArray(value)) {
      return truncate(value.join(", "), 50);
    }
    
    return truncate(value?.toString() || "—", 50);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Respondent</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No responses yet
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">
                    {formatDateTime(response.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {response.respondentEmail || (
                      <span className="text-muted-foreground">Anonymous</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="text-sm text-muted-foreground">
                      {renderAnswerPreview(response.answers)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(response.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Response Dialog */}
      <Dialog
        open={!!selectedResponse}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
            <DialogDescription>
              Submitted {formatDateTime(selectedResponse?.submittedAt ?? null)}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Metadata */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Respondent Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">
                      {selectedResponse?.respondentEmail || "Anonymous"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP Address:</span>
                    <p className="font-medium">
                      {selectedResponse?.respondentIp || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Answers</h4>
                {fields.map((field) => {
                  const value = selectedResponse
                    ? getAnswerValue(selectedResponse.answers, field.id)
                    : "—";
                  
                  return (
                    <div key={field.id} className="space-y-1 pb-4 border-b last:border-0">
                      <label className="text-sm font-medium">{field.label}</label>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
