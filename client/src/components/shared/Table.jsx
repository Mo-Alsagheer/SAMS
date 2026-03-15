import React, { useState } from "react";

function Table({ columns, data }) {
  const [sortConfig, setSortConfig] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const sortedData = [...data];

  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

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
  };

  const start = (page - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(start, start + rowsPerPage);

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <table className="min-w-full">

        <thead className="border-b text-gray-500 text-sm">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.header + index}
                onClick={() => col.accessor && requestSort(col.accessor)}
                className={`p-4 text-left ${
                  col.accessor ? "cursor-pointer" : ""
                }`}
              >
                {col.header} {col.accessor && "↕"}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-6 text-gray-400"
              >
                No data found
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >
                {columns.map((col, i) => (
                  <td key={col.header + i} className="p-4">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}

        </tbody>

      </table>

      {/* Pagination */}
      {data.length > rowsPerPage && (
        <div className="flex justify-between items-center p-4 text-sm">

          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          <span>
            Page {page} of {Math.ceil(data.length / rowsPerPage)}
          </span>

          <button
            onClick={() =>
              setPage((p) =>
                start + rowsPerPage < data.length ? p + 1 : p
              )
            }
            className="px-3 py-1 border rounded"
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
}

export default Table;