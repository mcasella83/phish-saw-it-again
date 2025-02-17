import { SongTag } from "./SongTag";

export const SongTagsDemo = () => {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <SongTag type="bustout" />
      <SongTag type="firstTime" />
      <SongTag type="lastTime" />
      <SongTag type="firstOpener" />
      <SongTag type="firstCloser" />
      <SongTag type="firstEncore" />
    </div>
  );
};
