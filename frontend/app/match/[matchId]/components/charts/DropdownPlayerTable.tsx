"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownPlayerTableProps {
  title?: string;
  columns: string[]; // remaining columns (excluding image)
  rows: (string | number)[][];
}

export default function DropdownPlayerTable({
  title = "View Players",
  columns,
  rows,
}: DropdownPlayerTableProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Dropdown button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border shadow-md hover:bg-gray-50"
      >
        <span className="font-medium">{title}</span>
        {/* Rotating Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Animated Table */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="table"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border border-t-0 shadow-md bg-white"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b"></th> {/* empty header for image */}
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-4 py-2 font-semibold border-b">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {/* First column: image */}
                      <td className="px-4 py-2 border-b">
                        {typeof row[0] === "string" && (row[0].startsWith("http://") || row[0].startsWith("https://")) ? (
                          <img
                            src={row[0]}
                            alt={`player-${rIdx}`}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          row[0]
                        )}
                      </td>

                      {/* Remaining columns */}
                      {row.slice(1).map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2 border-b">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
