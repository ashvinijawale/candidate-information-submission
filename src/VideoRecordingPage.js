import React, { useState, useRef, useEffect } from "react";
import "./VideoRecording.css";
import { useNavigate } from "react-router-dom";

const MAX_DURATION = 90; 

const VideoRecordingPage = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    async function initMedia() {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        setError("Camera and microphone access denied.");
      }
    }
    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (recording) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            setError("Recording stopped: duration exceeded 90 seconds.");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const startRecording = () => {
    if (!stream) return;
    setError("");
    setTimer(0);
    chunks.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result; 
        setVideoURL(base64data);

        const candidateData = JSON.parse(localStorage.getItem("candidateData")) || {};
        const combinedData = {
          ...candidateData,
          video: base64data, 
        };
        localStorage.setItem("finalSubmission", JSON.stringify(combinedData));
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleSubmit = () => {
    if (!videoURL) {
      setError("Please record a video before submitting.");
      return;
    }
    navigate("/review");
  };

  return (
    <div className="video-page">
      <h2>Video Recording Instructions</h2>

      <div className="instructions">
        <h3>Please record a short video covering:</h3>
        <ul>
          <li>A brief introduction about yourself.</li>
          <li>Why are you interested in this position?</li>
          <li>Highlight your relevant experience.</li>
          <li>Your long-term career goals.</li>
        </ul>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted={!recording}
          className="video-preview"
          controls={false}
          disablePictureInPicture={true}
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          onContextMenu={(e) => e.preventDefault()}
        ></video>

        {videoURL && !recording && (
          <video
            src={videoURL}
            controls
            className="recorded-video"
            disablePictureInPicture={true}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            onContextMenu={(e) => e.preventDefault()}
          ></video>
        )}
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(timer / MAX_DURATION) * 100}%` }}
        ></div>
      </div>

      <div className="controls">
        <p className="timer">
          {timer}s / {MAX_DURATION}s
        </p>

        {!recording ? (
          <button className="btn start" onClick={startRecording}>
            ▶ Start Recording
          </button>
        ) : (
          <button className="btn stop" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}

        <button className="btn submit" onClick={handleSubmit}>
          Proceed
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default VideoRecordingPage;
