import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PreferencesPage from "./PreferencesPage";

const DashboardPage = () => {

  const location = useLocation();
  const user = location.state?.user;
  const res = location.state?.data;
  if (!user) {
    return <p>Loading...</p>;
  }

  if(!res){
    return <p>No results found for search criteria. Try with different dates.</p>
  }

  const { name, startDate, endDate, budget, originCity } = user;

  // Calculate the duration of the trip
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = (end - start) / (1000 * 60 * 60 * 24) + 1;

  // Hardcoded recommendations
  // const recommendations = [
  //   {
  //     title: "Recommendation 1",
  //     imageUrl: "https://via.placeholder.com/150",
  //     projectedBudget: 100,
  //   },
  //   {
  //     title: "Recommendation 2",
  //     imageUrl: "https://via.placeholder.com/150",
  //     projectedBudget: 200,
  //   },
  //   {
  //     title: "Recommendation 3",
  //     imageUrl: "https://via.placeholder.com/150",
  //     projectedBudget: 300,
  //   },
  // ];

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
      position: "absolute",
      top: "20px",
      left: "20px",
      color: "#fff",
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
    infoContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      maxWidth: "1200px",
      padding: "20px",
    },
    recommendations: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    recommendationsTable: {
      borderCollapse: "collapse",
      width: "100%",
    },
    tableHeader: {
      borderBottom: "2px solid #66bb6a",
      textAlign: "center",
      padding: "8px",
      backgroundColor: "#f7fff7",
      color: "#3a3a3a",
      fontWeight: "bold",
    },
    tableRow: {
      borderBottom: "1px solid #e0e0e0",
    },
    tableCell: {
      padding: "8px",
      textAlign: "center",
    },
    image: {
      width: "100px",
      height: "100px",
      borderRadius: "8px",
      objectFit: "cover",
    },
    recommendationTitle: {
      textDecoration: "none",
      color: "#3a3a3a",
      fontWeight: "bold",
      cursor: "pointer",
    },
    tripDetailsBox: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "30px",
      borderRadius: "10px",
      width: "600px", // Increase the width
      maxWidth: "100%",
      textAlign: "center",
    },
    projectedBudget: {
      marginTop: "8px",
      color: "#66bb6a",
      fontSize: "14px",
      fontWeight: "bold",
    },
    subtitle: {
      marginBottom: "20px",
    },
  };

  return (
    <div style={style.container}>
    <h1 style={style.title}>Hi, {name}!</h1>
    <div style={style.infoContainer}>
        <div style={style.recommendations}>
          <div style={style.tripDetailsBox}>
          <h2 style={style.subtitle}>Recommendations</h2>
          <table style={style.recommendationsTable}>
            <thead>
              <tr>
                <th style={style.tableHeader}>Name: </th>
                <th style={style.tableHeader}>Places of Interests: </th>
                <th style={style.tableHeader}>Estimated Budget: </th>
              </tr>
            </thead>
            <tbody>
              {res.map((rec, index) => (
                <tr key={index} style={style.tableRow}>
                  <td style={style.tableCell}>
                    {rec.name}
                  </td>
                  <td style={style.tableCell}>
                    {rec.poi[0]}
                  </td>
                  <td style={style.tableCell}>
                    {rec.budget}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
        </div>
      <div style={style.tripDetailsBox}>
        <h2 style={style.subtitle}>Your Trip Details</h2>
        <p>Origin City: {originCity}</p>
        <p>Budget: ${budget}</p>
        <p>Start Date: {startDate}</p>
        <p>End Date: {endDate}</p>
        <p>Duration: {duration} days</p>
      </div>
    </div>
  </div>
);
};

export default DashboardPage;
