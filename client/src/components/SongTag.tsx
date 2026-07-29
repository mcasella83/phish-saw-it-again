import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type TagType =
  | "bustout"
  | "firstTime"
  | "lastTime"
  | "firstOpener"
  | "firstCloser"
  | "firstEncore"
  | "only";

interface SongTagProps {
  type: TagType;
  className?: string;
}

const tagStyles: Record<Exclude<TagType, "lastTime">, string> = {
  bustout: "bg-purple-500 hover:bg-purple-600",
  firstTime: "bg-green-500 hover:bg-green-600",
  firstOpener: "bg-blue-500 hover:bg-blue-600",
  firstCloser: "bg-blue-500 hover:bg-blue-600",
  firstEncore: "bg-blue-500 hover:bg-blue-600",
  only: "bg-orange-500 hover:bg-orange-600",
};

const tagLabels: Record<TagType, string> = {
  bustout: "Bust",
  firstTime: "1st",
  lastTime: "last",
  firstOpener: "Open",
  firstCloser: "Close",
  firstEncore: "Encore",
  only: "Only",
};

export const SongTag = ({ type, className }: SongTagProps) => {
  if (type === "lastTime") {
    return (
      <span
        className={cn(
          "text-xs text-blue-900 font-normal tracking-wide",
          className,
        )}
      >
        {tagLabels[type]}
      </span>
    );
  }

  return (
    <Badge
      variant="default"
      className={cn("font-semibold px-3 py-1", tagStyles[type], className)}
    >
      {tagLabels[type]}
    </Badge>
  );
};
