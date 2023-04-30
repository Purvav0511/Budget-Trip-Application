import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "react-bootstrap"; // Add this line
import PreferencesPage from "./PreferencesPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const DashboardPage = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const res = location.state?.data;
  const [expandedCardIndex, setExpandedCardIndex] = useState(-1);
  const [expandedCard, setExpandedCard] = useState(null);
  if (!user) {
    return <p>Loading...</p>;
  }

  const handleCardClick = (rec) => {
    setExpandedCard(rec);
  };

  const closeExpandedCard = () => {
    setExpandedCard(null);
  };

  const ExpandedCard = ({ rec, onClose }) => {
    const expandedCardStyle = {
      position: "fixed",
      zIndex: 2,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      overflowY: "auto",
      padding: "20px",
      boxSizing: "border-box",
    };
  
    const closeButtonStyle = {
      position: "absolute",
      top: "10px",
      right: "10px",
      border: "none",
      borderRadius: "50%",
      backgroundColor: "#f44336",
      color: "white",
      fontSize: "18px",
      width: "30px",
      height: "30px",
      lineHeight: "30px",
      textAlign: "center",
      cursor: "pointer",
    };
  
    const titleStyle = {
      margin: "20px 0",
      fontSize: "24px",
      fontWeight: "bold",
    };
  
    const subTitleStyle = {
      fontSize: "18px",
      fontWeight: "500",
      color: "purple",
    };
  
    const poiListStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "10px",
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "24px",
    };
  
    const poiItemStyle = {
      backgroundColor: "#f5f5f5",
      borderRadius: "5px",
      padding: "10px",
    };
  
    const iconStyle = {
      marginRight: "5px",
      color: "#673ab7",
    };
  
    return (
      <div style={expandedCardStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          &times;
        </button>
        <h2 style={titleStyle}>{rec.name}</h2>
        <p style={subTitleStyle}>Estimated Budget: ${rec.budget}</p>
        <p style={subTitleStyle}>Places of Interest:</p>
        <div style={poiListStyle}>
          {rec.poi.map((value, id) => {
            return (
              <div key={id} style={poiItemStyle}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={iconStyle} />
                {value}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  const styles={
    noResultsButton: {
      backgroundColor: "#66bb6a",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      marginTop: "20px", // Add some space between the text and the button
    },

    noResultsText: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#3a3a3a",
      textAlign: "center",
      marginBottom: "20px",
    },

    container: {
      background: "white",
      backgroundSize: "cover",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Roboto', sans-serif",
    },
  }
  const handleNoResultsButtonClick = () => {
    navigate("/preferences", { state: { user: user } });
  };

  if(!res["past_search"]["city"] || res["past_search"]["city"].length===0){
    res["past_search"]["city"] = res["cities"]
  }

  if(!res["cities"] || res["cities"].length===0){
    return (
      <div style={styles.container}>
        <p style={styles.noResultsText}>
          No results found for search criteria. Try with different dates.
        </p>
        <button
          style={styles.noResultsButton}
          onClick={handleNoResultsButtonClick}
        >
          Go Back to Preferences
        </button>
      </div>
    );
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

  const similarSearches = [
    {
      title: "Similar Search 1",
      imageUrl: "https://via.placeholder.com/150",
      projectedBudget: 150,
    },
    {
      title: "Similar Search 2",
      imageUrl: "https://via.placeholder.com/150",
      projectedBudget: 250,
    },
    {
      title: "Similar Search 3",
      imageUrl: "https://via.placeholder.com/150",
      projectedBudget: 350,
    },
  ];

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

    editButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "#66bb6a",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "5px 10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "bold",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      maxWidth: "1200px",
      padding: "20px",
    },
    recommendations: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "100%",
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
      width: "300px", // Increase the width
      position: "absolute",
      maxWidth: "100%",
      textAlign: "center",
      top: "100px", // Add this line (adjust the value to your preference)
      left: "50px",
    },

    tripDetailsBoxRec: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "30px",
      borderRadius: "10px",
      width: "600px", // Increase the width
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      maxWidth: "100%",
      textAlign: "center",
      position: "absolute",
      right: "50px",
    },

    tripDetailsBoxSim: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "30px",
      borderRadius: "10px",
      width: "600px", // Increase the width
      maxWidth: "100%",
      textAlign: "center",
      position: "absolute",
      bottom: "47px", // Add this line
      left: "20px", // Add this line
    },

    card: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "20px",
      borderRadius: "10px",
      width: "calc(50% - 40px)",
      maxWidth: "100%",
      textAlign: "center",
      margin: "10px",
      boxSizing: "border-box",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Add a subtle box shadow
      transition: "transform 0.3s ease-in-out",
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

    similarSearches: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: "100%",
      margin: "0 auto",
    },
    similarCard: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "20px",
      borderRadius: "10px",
      width: "calc(33.333% - 40px)", // Change width to fit 3 cards in a single row
      maxWidth: "100%",
      textAlign: "center",
      margin: "10px",
      boxSizing: "border-box",
    },
  };

  const handleEditButtonClick = () => {
    navigate("/preferences", { state: { user: user } });
  };

  return (
    <div style={style.container}>
    <h1 style={style.title}>Hi, {name}!</h1>
    <div style={style.infoContainer}>
      <div style={style.tripDetailsBox}>
        <h2 style={style.subtitle}>Your Trip Details</h2>
          <button style={style.editButton} onClick={handleEditButtonClick}>
          Edit
        </button>
        <p>Origin City: {originCity}</p>
        <p>Budget: ${budget}</p>
        <p>Start Date: {startDate}</p>
        <p>End Date: {endDate}</p>
        <p>Duration: {duration} days</p>
      </div>
        <div style={style.recommendations}>
      <div style={style.tripDetailsBoxRec}>
        <h2 style={style.subtitle}>Recommendations</h2>
        <div style={style.recommendations}>
          {res["cities"].map((rec, index) => (
          <Card
            key={index}
            style={style.card}
            onClick={() => handleCardClick(rec)} // Pass rec data to the function
          >
              <Card.Body>
              <Card.Title style={{ fontWeight: "bold" }}>{rec.name}</Card.Title>
                <Card.Text>Estimated Budget: ${rec.budget}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
    <div style={style.tripDetailsBoxSim}>
    <h2 style={style.subtitle}>Past Searches</h2>
    <div style={style.similarSearches}>
      {res["past_search"]["city"].map((search, index) => (
        <div style={style.similarCard}>
        {index<=2 && <Card key={index} >
        <Card.Body>
          <Card.Title style={{fontWeight: "bold", color: "purple"}}>{search.name}</Card.Title>
          <Card.Text>Projected Budget: ${search.budget}</Card.Text>
        </Card.Body>
      </Card>}
      </div>
))}
    </div>
  </div>
    </div>
        {expandedCard && (
        <ExpandedCard rec={expandedCard} onClose={closeExpandedCard} />
      )}
  </div>
);
};

export default DashboardPage;
