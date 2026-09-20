import React, { useState } from "react";

const SalaryRangeSlider = ({ filters, handleFilterChange }) => {
  const [minSalary, setMinSalary] = useState(filters?.minSalary || 0);
  const [maxSalary, setMaxSalary] = useState(filters?.maxSalary || 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Salary
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            value={minSalary || ""}
            onChange={({ target }) => setMinSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "minSalary",
                minSalary ? parseInt(minSalary) : ""
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-700 focus:ring focus:ring-teal-300/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Salary
          </label>
          <input
            type="number"
            placeholder="No limit"
            min="0"
            step="1000"
            value={maxSalary || ""}
            onChange={({ target }) => setMaxSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "maxSalary",
                maxSalary ? parseInt(maxSalary) : ""
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-700 focus:ring focus:ring-teal-300/50 focus:outline-none"
          />
        </div>
      </div>

      {/* display current range */}
      {minSalary || maxSalary ? (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
          Range: {minSalary ? `\u20B9${minSalary.toLocaleString()}` : `$0`} -{" "}
          {maxSalary ? `\u20B9${maxSalary.toLocaleString()}` : `No limit`}
        </div>
      ) : null}
      <p className="text-xs text-red-500 text-center">
        Salary filtering works only for yearly ranges
      </p>
    </div>
  );
};

export default SalaryRangeSlider;
