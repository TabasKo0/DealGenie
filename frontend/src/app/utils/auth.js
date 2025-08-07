import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY


export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, secretKey);
};
