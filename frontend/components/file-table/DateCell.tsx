import { useEffect, useState } from "react";

export function DateCell({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    const d = new Date(date);
    setFormatted(d.toLocaleString());
  }, [date]);

  return <div>{formatted}</div>;
}
