import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import applicationRoutes from './routes/application.routes';
import farmRoutes from './routes/farm.routes';
import inspectionRoutes from './routes/inspection.routes';
import traceabilityRoutes from './routes/traceability.routes';
import surveyRoutes from './routes/survey.routes';
import standardRoutes from './routes/standard.routes';
import reportRoutes from './routes/report.routes';
import { jwtAuth } from './middleware/auth';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', jwtAuth, userRoutes);
app.use('/api/applications', jwtAuth, applicationRoutes);
app.use('/api/farms', jwtAuth, farmRoutes);
app.use('/api/inspections', jwtAuth, inspectionRoutes);
app.use('/api/traceability', jwtAuth, traceabilityRoutes);
app.use('/api/surveys', jwtAuth, surveyRoutes);
app.use('/api/standards', jwtAuth, standardRoutes);
app.use('/api/reports', jwtAuth, reportRoutes);

// Error handling
app.use(errorHandler);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GACP API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
