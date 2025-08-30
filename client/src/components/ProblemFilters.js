import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";

const ProblemFilters = ({ onFilterChange, allDifficulties = [], allTags = [], filters }) => {
  const [search, setSearch] = useState(filters?.search || "");
  const [difficulty, setDifficulty] = useState(filters?.difficulty || "");
  const [tag, setTag] = useState(filters?.tag || "");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownFocus, setDropdownFocus] = useState(null);
  const { user } = useAuth();

  const handleChange = (key, value) => {
    const newFilters = {
      search,
      difficulty,
      tag,
      [key]: value,
    };

    setSearch(newFilters.search);
    setDifficulty(newFilters.difficulty);
    setTag(newFilters.tag);

    onFilterChange(newFilters);
  };

  const handleMyProblems = () => {
    onFilterChange({ showMine: true });
    toast.success("Showing Your Problems!");
  };

  const handleReset = () => {
    setSearch("");
    setDifficulty("");
    setTag("");
    onFilterChange({ search: "", difficulty: "", tag: "", showMine: false });
    toast.success("Filters cleared!");
  };

  const glassBlueStyle = {
    position: "relative",
    borderRadius: 10,
    width: 180,
    fontSize: 16,
    color: "#ffffffff",
    background: "#2f364269",
    backdropFilter: "blur(8px) saturate(150%)",
    WebkitBackdropFilter: "blur(8px) saturate(150%)",
    border: "1px solid rgba(0, 102, 255, 0.4)",
    boxShadow: "4px 4px 5px rgba(2, 0, 129, 0.42)",
    padding: "8px",
    userSelect: "none",
    outline: "none",
    marginRight: "10px",
    transition: "all 0.5s ease",
  };

  const glassBlueFocus = {
    ...glassBlueStyle,
    background: "#00000069",
    boxShadow: "0 0 10px rgba(0, 60, 255, 0.63)",
    border: "1px solid rgba(0, 255, 255, 0.8)",
  };

  return (
    <div className="filter-section" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by title or description..."
        value={search}
        onChange={(e) => handleChange("search", e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        style={searchFocused ? glassBlueFocus : glassBlueStyle}
      />

      <select
        value={difficulty}
        onChange={(e) => handleChange("difficulty", e.target.value)}
        onFocus={() => setDropdownFocus("difficulty")}
        onBlur={() => setDropdownFocus(null)}
        style={dropdownFocus === "difficulty" ? glassBlueFocus : glassBlueStyle}
      >
        <option value="">All Difficulties</option>
        {(allDifficulties || []).map((d, i) => (
          <option key={i} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={tag}
        onChange={(e) => handleChange("tag", e.target.value)}
        onFocus={() => setDropdownFocus("tag")}
        onBlur={() => setDropdownFocus(null)}
        style={dropdownFocus === "tag" ? glassBlueFocus : glassBlueStyle}
      >
        <option value="">All Tags</option>
        {(allTags || []).map((t, i) => (
          <option key={i} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button onClick={handleReset} className="btn glossy primary">
        Reset Filters
      </button>
      {user && (
      <button onClick={handleMyProblems} className="btn glossy primary">
        My Problems
      </button>
      )}
    </div>
  );
};

export default ProblemFilters;