import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateForm.css";

const CandidateInformationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    positionApplied: "",
    currentPosition: "",
    experience: "",
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);

  const positions = [
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Data Analyst",
    "Software Engineer",
  ];

  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

 
  const handleSelect = (position) => {
    setFormData({ ...formData, positionApplied: position });
    setShowDropdown(false);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };


  const validate = () => {
    const newErrors = {};
    const { firstName, lastName, positionApplied, currentPosition, experience, resume } = formData;

    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!positionApplied.trim()) newErrors.positionApplied = "Position Applied For is required";
    if (!currentPosition.trim()) newErrors.currentPosition = "Current Position is required";
    if (!experience || experience <= 0) newErrors.experience = "Experience must be greater than 0";
    if (!resume) {
      newErrors.resume = "Please upload your resume (PDF only)";
    } else if (resume.type !== "application/pdf") {
      newErrors.resume = "Resume must be a PDF file";
    } else if (resume.size > 5 * 1024 * 1024) {
      newErrors.resume = "File size must not exceed 5 MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) return;

    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Resume = reader.result;

      const candidateData = {
        ...formData,
        resume: base64Resume,
      };
      localStorage.setItem("candidateData", JSON.stringify(candidateData));

      navigate("/video");
    };

    reader.readAsDataURL(formData.resume);
  };

  return (
    <div className="form-container">
      <h2>Candidate Form</h2>

      <form onSubmit={handleNext}>
        <label className="highlight-label">
          First Name
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter First Name"
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}
        </label>

        <label className="highlight-label">
          Last Name
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter Last Name"
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </label>

        <label className="highlight-label">
          Position Applied For
          <div
            className="custom-dropdown"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="dropdown-selected">
              {formData.positionApplied || "-Select Position-"}
            </div>
            {showDropdown && (
              <ul className="dropdown-list">
                {positions.map((pos) => (
                  <li key={pos} onClick={() => handleSelect(pos)}>
                    {pos}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.positionApplied && <p className="error">{errors.positionApplied}</p>}
        </label>

        <label className="highlight-label">
          Current Position
          <input
            type="text"
            name="currentPosition"
            value={formData.currentPosition}
            onChange={handleChange}
            placeholder="Enter Current Position"
          />
          {errors.currentPosition && <p className="error">{errors.currentPosition}</p>}
        </label>

        <label className="highlight-label">
          Experience (in Years)
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          />
          {errors.experience && <p className="error">{errors.experience}</p>}
        </label>

        <label className="highlight-label">
          Upload Resume (PDF ≤ 5MB)
          <div className="upload-box">
            <input
              type="file"
              name="resume"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="upload-btn"
              onClick={handleFileClick}
            >
              Upload File
            </button>
            {formData.resume && <p className="file-name">{formData.resume.name}</p>}
          </div>
          {errors.resume && <p className="error">{errors.resume}</p>}
        </label>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default CandidateInformationForm;
