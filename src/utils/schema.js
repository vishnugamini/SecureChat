const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const statsSchema = new mongoose.Schema({
    rooms: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    texts: { type: Number, default: 0 },
});

const statsHistorySchema = new mongoose.Schema({
    rooms: { type: Number, required: true },
    users: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
});

  

const Stats = mongoose.model('Stats', statsSchema);
const StatsHistory = mongoose.model('StatsHistory', statsHistorySchema);

async function logCurrentStats() {
  const stats = await getOrCreateStats();
  const statsHistory = new StatsHistory({
    rooms: stats.rooms,
    users: stats.users,
    texts: stats.texts,
    timestamp: new Date()
  });
  await statsHistory.save();
  // console.log('Current stats logged:', statsHistory);
  console.log('Current stats logged');
}

async function getOrCreateStats() {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }
    return stats;
}
  
async function incrementRoomsCount() {
    const stats = await getOrCreateStats();
    stats.rooms += 1;
    await stats.save();
    await logCurrentStats();
    console.log('Rooms count incremented:', stats.rooms);
}

  async function incrementUsersCount() {
    const stats = await getOrCreateStats();
    stats.users += 1;
    await stats.save();
    await logCurrentStats();
    console.log('Users count incremented:', stats.users);
}
async function incrementTextsCount() {
    const stats = await getOrCreateStats();
    stats.texts += 1;
    await stats.save();
    console.log('Texts count incremented:', stats.texts);
}

module.exports = {
    getOrCreateStats,
    incrementRoomsCount,
    incrementUsersCount,
    incrementTextsCount
}