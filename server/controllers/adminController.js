const User = require('../models/User');
const Note = require('../models/Note');
const Link = require('../models/Link');
const Document = require('../models/Document');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalNotes, totalLinks, totalDocs, adminCount, publicNotes, publicLinks, publicDocs] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Link.countDocuments(),
      Document.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Note.countDocuments({ isPublic: true }),
      Link.countDocuments({ isPublic: true }),
      Document.countDocuments({ isPublic: true })
    ]);

    res.json({
      totalUsers,
      totalNotes,
      totalLinks,
      totalDocs,
      totalItems: totalNotes + totalLinks + totalDocs,
      totalShared: publicNotes + publicLinks + publicDocs,
      roles: {
        admin: adminCount,
        user: totalUsers - adminCount
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const [notesCount, linksCount, docsCount] = await Promise.all([
          Note.countDocuments({ user: u._id }),
          Link.countDocuments({ user: u._id }),
          Document.countDocuments({ user: u._id })
        ]);
        return {
          _id: u._id,
          username: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          counts: {
            notes: notesCount,
            links: linksCount,
            documents: docsCount,
            total: notesCount + linksCount + docsCount
          }
        };
      })
    );

    res.json(usersWithCounts);
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated', user: { _id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Admin cannot delete their own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Cascade delete user data
    await Promise.all([
      Note.deleteMany({ user: req.params.id }),
      Link.deleteMany({ user: req.params.id }),
      Document.deleteMany({ user: req.params.id })
    ]);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
