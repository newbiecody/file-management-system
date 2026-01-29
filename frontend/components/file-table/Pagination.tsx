import { noop } from "@/lib/utils";
import { Button } from "../ui/button";

interface IPagination {
  countSelected: number;
  countTotal: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  handlePrev?: () => void;
  handleNext?: () => void;
  isDisabled?: boolean;
}
export default function Pagination({
  countSelected,
  countTotal,
  hasNext = false,
  hasPrev = false,
  handlePrev = noop,
  handleNext = noop,
  isDisabled = true,
}: IPagination) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="text-muted-foreground flex-1 text-sm">
        {countSelected} of {countTotal} row(s) selected.
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!hasPrev || isDisabled}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!hasNext || isDisabled}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
