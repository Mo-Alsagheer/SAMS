import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function Table({
  columns,
  data,
  rowsPerPage = 5,
  loading = false,
  defaultSort = null, // { key: "name", direction: "ascending" }
}) {
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [page, setPage] = useState(1);

  // Sorting (memoized)
  const sortedData = useMemo(() => {
    const sortable = [...data];

    if (!sortConfig) return sortable;

    sortable.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sortable;
  }, [data, sortConfig]);

  // Sort request
  const requestSort = (key) => {
    let direction = "ascending";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }

    setSortConfig({ key, direction });
    setPage(1); // reset page after sorting
  };

  // Pagination
  const start = (page - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(start, start + rowsPerPage);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="bg-card text-foreground shadow rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.accessor && requestSort(col.accessor)}
                  className={`h-10 px-2 sm:px-4 text-left align-middle font-medium whitespace-nowrap text-foreground ${
                    col.accessor ? "cursor-pointer select-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.accessor && (
                      <ArrowUpDown
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array(rowsPerPage)
                .fill(0)
                .map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="border-b">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="p-2 sm:p-4">
                        {cIdx === 0 ? (
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        ) : (
                          <Skeleton className="h-4 w-full" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center p-6 text-muted-foreground"
                >
                  No data
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {columns.map((col) => (
                    <td
                      key={`${row.id}-${col.accessor || col.header}`}
                      className="p-2 sm:p-4 align-middle break-words text-foreground"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > rowsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-4 text-sm text-foreground">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border border-border rounded hover:bg-muted/50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) => (start + rowsPerPage < data.length ? p + 1 : p))
            }
            className="px-3 py-1 border border-border rounded hover:bg-muted/50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;
