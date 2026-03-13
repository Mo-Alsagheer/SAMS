import React from "react";

function Table({ columns, data }) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">

      <table className="w-full">

        <thead className="border-b text-gray-500 text-sm">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="p-4 text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition"
            >

              {columns.map((col) => (
                <td key={col.header} className="p-4">
                  {col.render
                    ? col.render(row)
                    : row[col.accessor]}
                </td>
              ))}

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Table;