import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import axios from "axios"
import {format} from "date-fns"

import "./App.css";
import LoginPage from "./LoginPage";
import PreferencesPage from "./PreferencesPage";
import DashboardPage from "./DashboardPage";

const baseUrl = "http://localhost:8000"

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
          path="/preferences" 
          element={
          <PreferencesPage 
          location={window.location} 
          user={useLocation.state?.user}
          />} />
          <Route
  path="/dashboard"
  element={
    <DashboardPage
    user={useLocation.state?.user}
    res={useLocation.state?.res}
    preferences={useLocation.state?.preferences}
    />
  }
/>
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
