const express = require('express');
const router = express.Router();
const multer = require('multer');
const Candidate = require('../models/Candidate');
const fs = require('fs');
const { getBucket } = require('../db'); 
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'resume' ? 'uploads/resumes/' : 'uploads/videos/';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

const validateVideoDuration = (videoPath, maxDuration = 90) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (duration > maxDuration) return reject(new Error('Video exceeds maximum duration of 90 seconds'));
      resolve(true);
    });
  });
};

router.post('/', upload, async (req, res) => {
  try {
    const { firstName, lastName, positionApplied, currentPosition, experienceYears } = req.body;

    if (!firstName || !lastName || !positionApplied || !currentPosition || !experienceYears)
      return res.status(400).json({ message: 'All fields are required' });

    if (!req.files || !req.files.resume || !req.files.video)
      return res.status(400).json({ message: 'Resume and video are required' });

    const resumePath = req.files.resume[0].path;
    const videoPath = req.files.video[0].path;
    const bucket = getBucket();

    if (!bucket) return res.status(500).json({ message: 'GridFSBucket not initialized yet. Try again later.' });
    await validateVideoDuration(videoPath);

    const uploadStream = bucket.openUploadStream(req.files.video[0].originalname, {
      contentType: req.files.video[0].mimetype,
    });

    fs.createReadStream(videoPath)
      .pipe(uploadStream)
      .on('error', (err) => {
        console.error('Error uploading video to GridFS:', err);
        res.status(500).json({ message: 'Error uploading video' });
      })
      .on('finish', async () => {
        try {
          const newCandidate = new Candidate({
            firstName,
            lastName,
            positionApplied,
            currentPosition,
            experienceYears,
            resume: resumePath,
            video: uploadStream.id, 
          });

          await newCandidate.save();

         
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

          res.status(201).json({ message: 'Candidate saved successfully!' });
        } catch (err) {
          console.error('Error saving candidate document:', err);
          res.status(500).json({ message: 'Error saving candidate information' });
        }
      });

  } catch (err) {
    console.error('Error in candidate upload:', err);
    if (req.files) {
      if (req.files.video && fs.existsSync(req.files.video[0].path)) fs.unlinkSync(req.files.video[0].path);
      if (req.files.resume && fs.existsSync(req.files.resume[0].path)) fs.unlinkSync(req.files.resume[0].path);
    }
    res.status(500).json({ message: err.message || 'Server error while saving candidate' });
  }
});

module.exports = router;
