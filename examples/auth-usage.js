/**
 * Example: Using Shared Auth Module
 */

const router = express.Router();

// Example: Protected route with role validation
router.get(
  '/admin-only',
  auth.authenticateToken,
  auth.requireRole(['admin', 'super-admin']),
  (req, res) => {
    res.standardSuccess({
      message: 'Welcome admin!',
      user: req.user,
    });
  },
);

// Example: Login endpoint
router.post('/login', validation.validationRules.userLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verify user credentials (your logic here)
    const user = await User.findOne({ email });
    if (!user || !(await auth.comparePassword(password, user.password))) {
      return res.unauthorized('Invalid credentials', 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    }

    // Generate token
    const tokens = auth.generateToken(user);

    res.standardSuccess(
      {
        tokens,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      {
        message: 'Login successful',
        messageThTh: 'เข้าสู่ระบบสำเร็จ',
      },
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
