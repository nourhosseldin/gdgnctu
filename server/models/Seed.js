const User = require('./User');
const Track = require('./Track');
const Event = require('./Event');
const bcrypt = require('bcryptjs');

async function seedData() {
  const adminExists = await User.findOne({ email: 'admin@gdg.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      email: 'admin@gdg.com',
      password: hashedPassword,
      role: 'SuperAdmin',
      track: 'All',
      points: 100
    });
    console.log('Created Super Admin: admin@gdg.com / admin123');
  }

  const trackCount = await Track.countDocuments();
  if (trackCount === 0) {
    await Track.create({
      name: 'Flutter Development',
      type: 'Technical',
      description: 'Learn cross-platform mobile app development with Flutter.',
      modules: [
        {
          title: 'Module 1: Dart Basics',
          lessons: [
            { title: 'Introduction to Dart', videoUrl: 'https://youtube.com', taskDescription: 'Write a simple Dart program.' },
            { title: 'OOP in Dart', videoUrl: 'https://youtube.com', taskDescription: 'Create classes and objects in Dart.' }
          ]
        }
      ]
    });
    console.log('Created default Flutter Track with modules.');
  }

  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    await Event.create({
      title: 'GDG Info Session 2026',
      description: 'Kickoff meeting for the new season.',
      date: new Date(),
      speaker: 'GDG Board',
      location: 'Online / Google Meet',
      type: 'Upcoming'
    });
    console.log('Created default Event.');
  }
}

module.exports = seedData;
