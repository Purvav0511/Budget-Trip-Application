import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./LoginPage";
const PreferencesPage = (props) => {
    const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name;

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
    name,
    budget,
    startDate,
    endDate,
  };
  const preferences = {
    // Add any additional preferences here
  };
  navigate("/dashboard", { state: { user, preferences } });
  };

  const style = {
    container: {
        background: "url('https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') no-repeat center center fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Roboto', sans-serif",
      },
      form: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "30px",
        borderRadius: "10px",
        width: "400px",
        maxWidth: "100%",
        textAlign: "center",
      },
      title: {
        color: "#3a3a3a",
        marginBottom: "20px",
      },
      label: {
        display: "block",
        marginBottom: "5px",
      },
      input: {
        width: "100%",
        padding: "8px",
        marginBottom: "20px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
        fontFamily: "inherit",
      },
      button: {
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        backgroundColor: "#66bb6a",
        border: "none",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
      },
      links: {
        marginTop: "20px",
        fontSize: "12px",
      },
      link: {
        color: "#3a3a3a",
        textDecoration: "none",
      },
  };

  return (
    <div style={style.container}>
      <form onSubmit={handleSubmit} style={style.form}>
      <h1 style={style.title}>Hi, {name}! Tell us about your travel preferences</h1>
        <label htmlFor="budget" style={style.label}>
          Budget(In USD):
        </label>
        <input
          id="budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={style.input}
          min="0"
          step="1"
          placeholder="Enter budget amount"
        />
        <br />
        <label htmlFor="startDate" style={style.label}>
          Start Date:
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={style.input}
        />
        <br />
        <label htmlFor="endDate" style={style.label}>
          End Date:
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={style.input}
        />
        <br />
        {/* Add more preference fields as needed */}
        <button type="submit" style={style.button}>
          Step 2/4
        </button>
      </form>
    </div>
  );
};

export default PreferencesPage;
