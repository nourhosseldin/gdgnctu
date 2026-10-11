const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'Student' },
  track: { type: DataTypes.STRING, defaultValue: 'General' },
  season: { type: DataTypes.STRING, defaultValue: '2026-2027' },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  strikes: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Track = sequelize.define('Track', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  modules: { type: DataTypes.TEXT, defaultValue: '[]' } // JSON string
});

const Event = sequelize.define('Event', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  date: DataTypes.DATE,
  speaker: DataTypes.STRING,
  location: DataTypes.STRING,
  type: { type: DataTypes.STRING, defaultValue: 'Upcoming' }
});

const Submission = sequelize.define('Submission', {
  linkOrFile: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }
});

const Recruitment = sequelize.define('Recruitment', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  trackPreference: { type: DataTypes.STRING, allowNull: false },
  whyJoin: DataTypes.TEXT,
  status: { type: DataTypes.STRING, defaultValue: 'Applied' }
});

const Complaint = sequelize.define('Complaint', {
  message: { type: DataTypes.TEXT, allowNull: false }
});

// Associations
User.hasMany(Submission);
Submission.belongsTo(User);

Track.hasMany(Submission);
Submission.belongsTo(Track);

async function initDB() {
  await sequelize.sync({ alter: true });
  console.log('SQLite Database synchronized successfully.');
  
  // Seed initial data
  const bcrypt = require('bcryptjs');
  const adminCount = await User.count({ where: { email: 'admin@gdg.com' } });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      email: 'admin@gdg.com',
      password: hashedPassword,
      role: 'SuperAdmin',
      track: 'All',
      points: 150
    });
    console.log('Seeded Admin: admin@gdg.com / admin123');
  }

  const trackCount = await Track.count();
  if (trackCount === 0) {
    await Track.create({
      name: 'Flutter Development',
      type: 'Technical',
      description: 'Learn cross-platform mobile app development with Flutter.',
      modules: JSON.stringify([
        {
          title: 'Module 1: Dart Basics',
          lessons: [
            { title: 'Introduction to Dart', videoUrl: 'https://youtube.com', taskDescription: 'Write a basic Dart app.' },
            { title: 'Widgets & UI', videoUrl: 'https://youtube.com', taskDescription: 'Build a custom Flutter widget.' }
          ]
        }
      ])
    });
    console.log('Seeded Default Flutter Track.');
  }

  const eventCount = await Event.count();
  if (eventCount === 0) {
    await Event.create({
      title: 'GDG Info Session 2026',
      description: 'Kickoff meeting and orientation for new members.',
      date: new Date(),
      speaker: 'GDG Team',
      location: 'Google Meet',
      type: 'Upcoming'
    });
    console.log('Seeded Default Event.');
  }
}

module.exports = { sequelize, User, Track, Event, Submission, Recruitment, Complaint, initDB };
