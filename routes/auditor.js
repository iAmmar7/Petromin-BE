const fs = require('fs');
const express = require('express');
const moment = require('moment');
const formidable = require('formidable');
const router = express.Router();

// Load Models
const PrioritiesReport = require('../db/models/PrioritiesReport');

// @route   GET /api/auditor/test
// @desc    Test auditor rooutes
// @access  Private
router.get('/test', (req, res) => {
  res.json({ message: 'Auditor route works' });
});

// @route   POST /api/auditor/raise issue
// @desc    Submit priorities/issue report
// @access  Private
router.post('/raise-issue', async (req, res) => {
  const formData = formidable({
    uploadDir: './public/issues',
    keepExtensions: true,
    multiples: true,
  });

  formData.parse(req, async (error, fields, files) => {
    const { evidences } = files;
    try {
      if (error) throw 'Unable to upload image!';

      let arrayOfEvidences = [];

      if (evidences) {
        Object.keys(evidences).forEach((value) => {
          if (evidences[value] && evidences[value].path) {
            const path = evidences[value].path.split('public')[1];
            arrayOfEvidences.push(path);
          }
          if (value === 'path') {
            const path = evidences[value].split('public')[1];
            arrayOfEvidences.filter((item) => {
              if (item !== path) arrayOfEvidences.push(path);
            });
          }
        });
      }

      const report = await PrioritiesReport.create({
        user: req.user.id,
        date: moment(),
        week: moment().week() - moment().startOf('month').week() + 1,
        ...fields,
        evidencesBefore: arrayOfEvidences,
      });

      return res.status(200).json({ success: true, report });
    } catch (error) {
      if (evidences) fs.unlinkSync(evidences.path);
      if (error && error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Input fields validation error' });
      }

      return res.status(400).json({ success: false, message: error });
    }
  });
});

// @route   POST /api/user/priority-report/:id
// @desc    Update priority/issue report
// @access  Private
router.post('/priority-report/:id', async (req, res) => {
  const formData = formidable({
    uploadDir: './public/issues',
    keepExtensions: true,
    multiples: true,
  });

  console.log(req.params.id);

  if (!req.params.id) return;

  const report = await PrioritiesReport.findOne({ _id: req.params.id });

  if (!report) return res.status(400).json({ success: false, message: 'Unable to update report' });

  formData.parse(req, async (error, fields, files) => {
    const { evidencesBefore, evidencesAfter } = files;
    try {
      if (error) throw 'Unable to upload image!';

      let arrayOfEvidencesBeforeFiles = [],
        arrayOfEvidencesAfterFiles = [];

      if (evidencesBefore) {
        Object.keys(evidencesBefore).forEach((value) => {
          if (evidencesBefore[value] && evidencesBefore[value].path) {
            const path = evidencesBefore[value].path.split('public')[1];
            arrayOfEvidencesBeforeFiles.push(path);
          }
          if (value === 'path') {
            const path = evidencesBefore[value].split('public')[1];
            arrayOfEvidencesBeforeFiles.filter((item) => {
              if (item !== path) arrayOfEvidencesBeforeFiles.push(path);
            });
          }
        });
      }

      if (evidencesAfter) {
        Object.keys(evidencesAfter).forEach((value) => {
          if (evidencesAfter[value] && evidencesAfter[value].path) {
            const path = evidencesAfter[value].path.split('public')[1];
            arrayOfEvidencesAfterFiles.push(path);
          }
          if (value === 'path') {
            const path = evidencesAfter[value].split('public')[1];
            arrayOfEvidencesAfterFiles.filter((item) => {
              if (item !== path) arrayOfEvidencesAfterFiles.push(path);
            });
          }
        });
      }

      console.log(arrayOfEvidencesBeforeFiles);
      console.log(arrayOfEvidencesAfterFiles);

      let updatedEvidencesBefore = [...report.evidencesBefore, ...arrayOfEvidencesBeforeFiles];
      let updatedEvidencesAfter = [...report.evidencesAfter, ...arrayOfEvidencesAfterFiles];

      // Update db
      const updateReport = await PrioritiesReport.findOneAndUpdate(
        { _id: req.params.id },
        {
          ...fields,
          evidencesBefore: updatedEvidencesBefore,
          evidencesAfter: updatedEvidencesAfter,
          $push: {
            updatedBy: {
              name: req.user.name,
              id: req.user.id,
              time: new Date(),
            },
          },
        },
        { new: true },
      );

      if (!updateReport) throw 'Unable to update the report';

      return res.status(200).json({ success: true, report: updateReport });
    } catch (error) {
      if (evidencesBefore) fs.unlinkSync(evidencesBefore.path);
      if (evidencesAfter) fs.unlinkSync(evidencesAfter.path);
      if (error && error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Input fields validation error' });
      }

      return res.status(400).json({ success: false, message: error });
    }
  });
});

// @route   GET /api/auditor/cancel-issue/:id
// @desc    Cancel issue report
// @access  Private
router.get('/cancel-issue/:id', async (req, res) => {
  try {
    const updateReport = await PrioritiesReport.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      { status: 'Cancelled' },
      { new: true },
    );

    if (!updateReport) throw 'Failed to cancelled the issue';

    return res.status(200).json({ success: true, message: 'Successfully cancelled the issue' });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Unable to cancel the issue' });
  }
});

module.exports = router;
