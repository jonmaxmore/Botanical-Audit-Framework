describe('API Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user and token
    testUser = new User({
      email: 'api@test.com',
      password: 'hashedpassword123',
      firstName: 'API',
      lastName: 'Test',
      organizationType: 'farm',
      userType: 'farmer',
      accountStatus: 'active',
    });
    await testUser.save();

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' },
    );
  });

  describe('GET /health', () => {
    it('should return system health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('GET /api/applications', () => {
    it('should return applications for authenticated user', async () => {
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('applications');
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app).get('/api/applications').expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/applications', () => {
    it('should create new application', async () => {
      const applicationData = {
        farmName: 'Test Farm',
        herbs: ['ขมิ้นชัน'],
        farmSize: '5 ไร่',
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('application');
    });
  });

  describe('GET /api/documents', () => {
    it('should return documents for authenticated user', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
    });
  });
});
