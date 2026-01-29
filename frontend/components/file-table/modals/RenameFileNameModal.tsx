import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateFilename } from "@/lib/utils";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

interface RenameFileNameModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fileId: string;
  currentFilename: string;
  onConfirm: (newName: string) => void;
}

export default function RenameFileNameModal({
  isOpen,
  setIsOpen,
  currentFilename,
  onConfirm,
}: RenameFileNameModalProps) {
  const [newName, setNewName] = useState(currentFilename);
  const [errors, setErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentFilename);
      setErrors("");
    }
  }, [isOpen, currentFilename]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewName(value);
    setErrors(validateFilename(value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateFilename(newName);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    if (newName === currentFilename) {
      setIsOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(newName);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to rename file:", error);
      setErrors("Failed to rename file. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewName(currentFilename);
    setErrors("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update file name</DialogTitle>
          </DialogHeader>
          <DialogDescription>Enter a new name for your file</DialogDescription>
          <div className="grid gap-4 py-4">
            <Field data-invalid={Boolean(errors)}>
              <FieldLabel htmlFor="updated-name">New file name</FieldLabel>
              <Input
                id="updated-name"
                name="name"
                value={newName}
                onChange={handleNameChange}
                maxLength={255}
                disabled={isSubmitting}
                autoFocus
              />
              {errors && <FieldDescription>{errors}</FieldDescription>}
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || Boolean(errors)}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
