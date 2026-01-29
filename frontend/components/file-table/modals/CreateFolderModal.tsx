import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateFilename } from "@/lib/utils";
import { ChangeEvent, FormEvent, useState } from "react";

interface ICreateFolderModal {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onConfirm: (folderName: string) => void;
}
export default function CreateFolderModal({
  isOpen,
  setIsOpen,
  onConfirm,
}: ICreateFolderModal) {
  const [errors, setErrors] = useState("");
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateFilename(folderName);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    if (!Boolean(folderName.trim())) {
      setErrors("File name cannot be blank");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(folderName);
      setIsOpen(false);
    } catch (error) {
      setErrors("Failed to create folder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFolderName("");
    setErrors("");
    setIsOpen(false);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFolderName(value);
    setErrors(validateFilename(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
          </DialogHeader>
          <DialogDescription>Enter a name for your folder</DialogDescription>
          <div className="grid gap-4 py-4">
            <Field data-invalid={Boolean(errors)}>
              <FieldLabel htmlFor="updated-name">New folder name</FieldLabel>
              <Input
                id="updated-name"
                name="name"
                value={folderName}
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
