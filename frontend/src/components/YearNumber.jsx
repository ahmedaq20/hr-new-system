import React from "react";

function YearNumber({ selectedYear, onYearChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <div
      className="d-flex flex-wrap gap-2 mb-4 text-center justify-content-center mt-3"
      style={{ direction: "rtl"}}
    >
      {years.map((year) => (
        <button
          key={year}
          className={`btn ${
            selectedYear === year ? "btn-dark" : "btn-outline-dark"
          }`}
          style={{
            fontSize: "13px",
            padding: "6px 14px",
            minWidth: "70px",
          }}
          onClick={() => onYearChange(year)}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

export default YearNumber;
