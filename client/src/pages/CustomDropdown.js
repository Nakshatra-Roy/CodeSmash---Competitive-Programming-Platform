import React, { useState, useRef, useEffect } from "react";

const CustomDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.id === value)?.label || "Select";

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: 160,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 14,
        color: "#e0e0ff",
        userSelect: "none",
      }}
    >

      <div
        onClick={() => setOpen(!open)}
        style={{
          background:
            "rgba(0, 247, 255, 0.15)",
          border: "1.5px solid rgba(0, 225, 255, 0.4)",
          borderRadius: 10,
          padding: "8px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(0, 225, 255, 0.25)",
          transition: "background 0.3s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 183, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 162, 255, 0.15)";
        }}
      >
        <span>{selectedLabel}</span>
        <svg
          style={{ marginLeft: 8, width: 14, height: 14, fill: "#00b7ffff" }}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7l5 5 5-5H5z" />
        </svg>
      </div>

      {/* Dropdown list */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background:
              "rgba(31, 30, 43, 0.95)", // dark translucent background
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0, 225, 255, 0.25)",
            maxHeight: 240,
            overflowY: "auto",
            zIndex: 1100,
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(0, 146, 204, 0.3)",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                style={{
                  padding: "10px 18px",
                  cursor: "pointer",
                  color: isSelected ? "#00b7ffff" : "#cfcfff",
                  background: isSelected
                    ? "rgba(0, 204, 255, 0.12)"
                    : "transparent",
                  fontWeight: isSelected ? "600" : "normal",
                  userSelect: "none",
                  transition: "background 0.3s ease, color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 174, 255, 0.25)";
                  e.currentTarget.style.color = "#00ccffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected
                    ? "rgba(90, 217, 240, 0.12)"
                    : "transparent";
                  e.currentTarget.style.color = isSelected
                    ? "#00eeffff"
                    : "#cfcfff";
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;