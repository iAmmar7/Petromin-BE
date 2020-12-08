const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrioritesReportSchema = new Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    week: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
      enum: [
        'WR-North',
        'WR-South',
        'CR-East',
        'CR-South',
        'CR-North',
        'Southern',
        'ER-North',
        'ER-South',
      ],
    },
    areaManager: {
      type: String,
      required: true,
    },
    regionalManager: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Customer Experience',
        'Bay Violation',
        'Housekeeping',
        'Customer Mistreatment',
        'Initiative',
        'Admin Issues',
        'Safety',
        'Others',
      ],
    },
    issueDetails: {
      type: String,
      required: true,
    },
    stationNumber: {
      type: String,
      required: true,
    },
    dateIdentified: {
      type: Date,
      required: true,
    },
    evidencesBefore: [{ type: String }],
    evidencesAfter: [{ type: String }],
    actionTaken: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Resolved', 'Cancelled'],
    },
    feedback: {
      type: String,
      default: null,
    },
    dateOfClosure: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      default: null,
    },
    updatedBy: [
      {
        name: String,
        id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'user',
        },
        time: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = PrioritesReport = mongoose.model('prioritiesReport', PrioritesReportSchema);
