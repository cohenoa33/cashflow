"use client";

 
export default function DragDropComponent({
  onDrop,
  onDragOver,
  handleDivClick,
  onFileInputChange
}: {
  onDrop:(event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver:(event: React.DragEvent<HTMLDivElement>) => void;
  handleDivClick:(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onFileInputChange:(event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={handleDivClick}
      className="rounded-lg border border-dashed p-8 text-center cursor-pointer"
    >
      {/* Upload section */}
      <p className="text-md font-bold text-white">
        Drag & drop a CSV file or click below
      </p>
      <input
        type="file"
        accept=".csv"
        className="mt-3 hidden"
        onChange={onFileInputChange}
      />
    </div>
  );
}
