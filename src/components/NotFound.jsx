import React from "react";
import { Link } from "react-router-dom";
import "./css/NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound_container">
      <div className="notfound_card">
        <h1>404</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="notfound_link">Back to Login</Link>
      </div>
    </div>
  );
};

export default NotFound;
