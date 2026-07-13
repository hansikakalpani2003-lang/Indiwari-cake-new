const authService = require('../services/authService');
const asyncWrapper = require('../utils/asyncWrapper');

const register = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const { token, user } = await authService.registerCustomer(name, email, password, phone, address);
  res.status(201).json({ message: 'Account created successfully!', token, user });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.loginUser(email, password);
  res.status(200).json({ message: 'Login successful.', token, user });
});

const me = asyncWrapper(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.userId);
  res.status(200).json({ user });
});

module.exports = { register, login, me };