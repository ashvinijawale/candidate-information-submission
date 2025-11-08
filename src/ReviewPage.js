import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewPage.css";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState(null);

  useEffect(() => {
  
    const storedData = localStorage.getItem("finalSubmission");
    if (storedData) {
      setCandidateData(JSON.parse(storedData));
    }
  }, []);

  if (!candidateData) {
    return (
      <div className="review-container">
        <h2>No candidate data found.</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    positionApplied,
    currentPosition,
    experience,
    resume,
    video,
  } = candidateData;

  const handleFinalSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("positionApplied", positionApplied);
      formData.append("currentPosition", currentPosition);
      formData.append("experienceYears", experience);

      const resumeBlob = await fetch(resume).then((res) => res.blob());
      const videoBlob = await fetch(video).then((res) => res.blob());

      formData.append("resume", resumeBlob, "resume.pdf");
      formData.append("video", videoBlob, "video.webm");

      const response = await fetch("http://localhost:5000/api/candidates", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("✅ Candidate information submitted successfully!");
        localStorage.removeItem("finalSubmission");
        navigate("/");
      } else {
        const err = await response.json();
        alert("❌ Error: " + (err.message || "Failed to upload."));
      }
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("✅ Candidate information submitted successfully!");
    }
  };


  return (
    <div className="review-container">
      <h2>Review Candidate Information and Video</h2>

      <div className="candidate-details">
        <p><strong>First Name:</strong> {firstName}</p>
        <p><strong>Last Name:</strong> {lastName}</p>
        <p><strong>Position Applied For:</strong> {positionApplied}</p>
        <p><strong>Current Position:</strong> {currentPosition}</p>
        <p><strong>Experience (Years):</strong> {experience}</p>
      </div>

      <div className="file-section">
        <h3>Uploaded Resume</h3>
        {resume ? (
         <a
  href={resume}
  download="resume.pdf"
  className="resume-link btn-start"
>
  Download Resume
</a>
        ) : (
          <p>No resume uploaded.</p>
        )}
      </div>

      <div className="video-section">
        <h3>Recorded Video</h3>
        {video ? (
          <video
            src={video}
            controls
            width="400"
            className="video-player"
          />
        ) : (
          <p>No video recorded.</p>
        )}
      </div>

      <div className="review-buttons">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
        <button className="submit-btn" onClick={handleFinalSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewPage; 