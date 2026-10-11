const router = require('express').Router();
const { User, Track, Event, Submission, Recruitment, Complaint } = require('../db');
const { verifyToken, verifyRole } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { track } = req.query;
    let where = {};
    if (track && track !== 'All') where.track = track;
    const users = await User.findAll({
      where,
      order: [['points', 'DESC']],
      limit: 20,
      attributes: ['name', 'points', 'track', 'role']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await Track.findAll();
    const formatted = tracks.map(t => {
      const plain = t.toJSON();
      try {
        plain.modules = JSON.parse(plain.modules || '[]');
      } catch (e) {
        plain.modules = [];
      }
      return plain;
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/tracks', verifyToken, verifyRole(['SuperAdmin', 'President', 'TrackHead']), async (req, res) => {
  try {
    const { name, type, description, modules } = req.body;
    const track = await Track.create({
      name,
      type,
      description,
      modules: JSON.stringify(modules || [])
    });
    res.json(track);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/events', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR']), async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submissions
router.post('/submissions', verifyToken, async (req, res) => {
  try {
    const { trackId, lessonId, linkOrFile } = req.body;
    const submission = await Submission.create({
      UserId: req.user.id,
      TrackId: trackId,
      lessonId,
      linkOrFile
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/submissions', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR', 'TrackHead']), async (req, res) => {
  try {
    const subs = await Submission.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'track'] }]
    });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/submissions/:id', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR', 'TrackHead']), async (req, res) => {
  try {
    const { status } = req.body;
    const sub = await Submission.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    sub.status = status;
    await sub.save();

    if (status === 'Approved') {
      const student = await User.findByPk(sub.UserId);
      if (student) {
        student.points += 15;
        await student.save();
      }
    }
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recruitment
router.post('/recruitment', async (req, res) => {
  try {
    const rec = await Recruitment.create(req.body);
    res.json({ message: 'Application submitted successfully', rec });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recruitment', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR']), async (req, res) => {
  try {
    const list = await Recruitment.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complaints
router.post('/complaints', async (req, res) => {
  try {
    const comp = await Complaint.create({ message: req.body.message });
    res.json({ message: 'Anonymous feedback sent securely.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/complaints', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR']), async (req, res) => {
  try {
    const list = await Complaint.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Certificate PDF
router.get('/certificate/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${user.name}.pdf`);

    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    doc.pipe(res);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    doc.fontSize(30).fillColor('#4285F4').text('Google Developer Groups (GDG)', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).fillColor('#202124').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(25).fillColor('#34A853').text(user.name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).fillColor('#5F6368').text(`For successfully completing the track: ${user.track} in GDG Portal Season 2026-2027`, { align: 'center' });
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export Excel
router.get('/export/:type', verifyToken, verifyRole(['SuperAdmin', 'President', 'HR']), async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    if (type === 'users') {
      data = await User.findAll({ attributes: ['name', 'email', 'role', 'track', 'points', 'strikes'] });
    } else if (type === 'recruitment') {
      data = await Recruitment.findAll({ attributes: ['fullName', 'email', 'phone', 'trackPreference', 'status'] });
    } else {
      return res.status(400).json({ message: 'Invalid export type' });
    }

    const worksheet = XLSX.utils.json_to_sheet(data.map(d => d.toJSON()));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export.xlsx`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seasons
router.get('/seasons', async (req, res) => {
  try {
    res.json([{ name: '2026-2027', active: true, stats: { totalStudents: 120, totalEvents: 12, completedTasks: 350, trainingHours: 36 } }]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
