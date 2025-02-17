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

const tagStyles: Record<TagType, string> = {
  bustout: "bg-purple-500 hover:bg-purple-600",
  firstTime: "bg-green-500 hover:bg-green-600",
  lastTime: "bg-red-500 hover:bg-red-600",
  firstOpener: "bg-blue-500 hover:bg-blue-600",
  firstCloser: "bg-blue-500 hover:bg-blue-600",
  firstEncore: "bg-blue-500 hover:bg-blue-600",
  only: "bg-orange-500 hover:bg-orange-600",
};

const tagLabels: Record<TagType, string> = {
  bustout: "Bust",
  firstTime: "1st",
  lastTime: "Last",
  firstOpener: "Open",
  firstCloser: "Close",
  firstEncore: "Encore",
  only: "Only",
};

export const SongTag = ({ type, className }: SongTagProps) => {
  return (
    <Badge
      variant="default"
      className={cn("font-semibold px-3 py-1", tagStyles[type], className)}
    >
      {tagLabels[type]}
    </Badge>
  );
};
