"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border-2 border-paper-accent px-3 py-1 font-hand text-xl text-paper-accent hover:bg-paper-accent hover:text-black"
    >
      download PDF
    </button>
  );
}
