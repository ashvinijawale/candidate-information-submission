const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  positionApplied: { type: String, required: true },
  currentPosition: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  resume: { type: String, required: true },       
  video: { type: mongoose.Schema.Types.ObjectId }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
