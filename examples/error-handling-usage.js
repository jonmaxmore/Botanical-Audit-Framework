/**
 * Example: Using Shared Error Handling
 */

const router = express.Router();

// Example: Using custom error classes
router.get(
  '/user/:id',
  errors.catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new errors.NotFoundError('User', 'ไม่พบผู้ใช้');
    }

    if (!req.user.permissions.includes('read:users')) {
      throw new errors.AuthorizationError('Cannot read user data', 'ไม่สามารถอ่านข้อมูลผู้ใช้');
    }

    res.standardSuccess(user);
  })
);

// Example: Validation error
router.post(
  '/user',
  validation.commonValidations.email(),
  validation.commonValidations.name('firstName'),
  validation.validateRequest,
  errors.catchAsync(async (req, res) => {
    const user = await User.create(req.body);
    res.standardSuccess(user, {
      message: 'User created successfully',
      messageThTh: 'สร้างผู้ใช้สำเร็จ'
    });
  })
);

module.exports = router;
