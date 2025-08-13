import React from "react";
import { Link } from "react-router-dom";

const ProblemCard = ({ problem }) => {
  return (
    <div style={{
      border: "3px solid #ccc",
      borderRadius: "20px",
      padding: "1rem",
      marginBottom: "1rem"
    }}>
      <h3>{problem.title}</h3>
      <p>Difficulty: {problem.difficulty}</p>
      <Link to={`/problems/${problem.id}`}>Solve Now</Link>
    </div>
  );
};

export default ProblemCard;