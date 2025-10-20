describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new farmer user', async () => {
      const userData = {
        email: 'test@farmer.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Farmer',
        organizationType: 'farm',
        userType: 'farmer',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        organizationType: 'farm',
      };

      const response = await request(app).post('/api/auth/register').send(userData).expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const user = new User({
        email: 'login@test.com',
        password: 'hashedpassword123',
        firstName: 'Login',
        lastName: 'Test',
        organizationType: 'farm',
        userType: 'farmer',
        accountStatus: 'active',
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'hashedpassword123',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
