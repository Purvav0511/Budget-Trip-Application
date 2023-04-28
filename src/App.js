import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import "./App.css";
import LoginPage from "./LoginPage";
import PreferencesPage from "./PreferencesPage";
import DashboardPage from "./DashboardPage";

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/preferences" element={<PreferencesPage location={window.location} />} />
          <Route
  path="/dashboard"
  element={
    <DashboardPage
    user={useLocation.state?.user}
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
