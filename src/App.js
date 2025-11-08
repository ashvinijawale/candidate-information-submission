import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateInformationForm from "./candidate-form";
import VideoRecordingPage from "./VideoRecordingPage";
import ReviewPage from "./ReviewPage";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<CandidateInformationForm />} />
        <Route path="/video" element={<VideoRecordingPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
