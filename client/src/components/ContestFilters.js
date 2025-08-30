// client/src/components/ContestFilters.js
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";

const ContestFilters = ({ onFilterChange, allTags = [], allOrganizers = [] }) => {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownFocus, setDropdownFocus] = useState(null);
  const { user } = useAuth();

  const handleChange = (key, value) => {
    const newFilters = {
      search,
      tag,
      organizer,
      startDate,
      [key]: value,
    };

    setSearch(newFilters.search);
    setTag(newFilters.tag);
    setOrganizer(newFilters.organizer);
    setStartDate(newFilters.startDate);

    onFilterChange(newFilters); 
  };

  const handleReset = () => {
    setSearch("");
    setTag("");
    setOrganizer("");
    setStartDate("");
    onFilterChange({ search: "", tag: "", organizer: "", startDate: "" });
    toast.success("Filters cleared!");
  };

  const handleMyContests = () => {
    onFilterChange({ showMine: true });
    toast.success("Showing Your Contests!");
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
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or description..."
        value={search}
        onChange={(e) => handleChange("search", e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        style={searchFocused ? glassBlueFocus : glassBlueStyle}
      />

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

      <select
        value={organizer}
        onChange={(e) => handleChange("organizer", e.target.value)}
        onFocus={() => setDropdownFocus("organizer")}
        onBlur={() => setDropdownFocus(null)}
        style={dropdownFocus === "organizer" ? glassBlueFocus : glassBlueStyle}
      >
        <option value="">All Organizers</option>
        {(allOrganizers || []).map((o, i) => (
          <option key={i} value={o}>
            {o}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => handleChange("startDate", e.target.value)}
        style={glassBlueStyle}
      />

      <button onClick={handleReset} className="btn glossy primary">
        Reset Filters
      </button>
        {user && (
      <button onClick={handleMyContests} className="btn glossy primary">
        My Contests
      </button>
        )}
    </div>
  );
};

export default ContestFilters;