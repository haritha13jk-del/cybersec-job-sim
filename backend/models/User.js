const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: String,
  role: {
    type: String,
    default: 'student',
  },
}, { timestamps: true });

/* ================= REGISTER ================= */
userSchema.statics.register = async function(username, email, password, fullName) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new this({
    username,
    email,
    password: hashedPassword,
    fullName,
  });

  await user.save();
  return user._id;
};

/* ================= FIND ================= */
userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email });
};

userSchema.statics.findById = async function(id) {
  return await this.findById(id).select('-password');
};

/* ================= VERIFY PASSWORD ================= */
userSchema.statics.verifyPassword = async function(plain, hash) {
  return await bcrypt.compare(plain, hash);
};

/* ================= UPDATE ================= */
userSchema.statics.updateProfile = async function(userId, updates) {
  return await this.findByIdAndUpdate(userId, updates, { new: true });
};

module.exports = mongoose.model('User', userSchema);