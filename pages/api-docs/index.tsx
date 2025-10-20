import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useState, useEffect } from 'react';
import { Box, Container, Paper, Tab, Tabs, Typography, Button, Alert } from '@mui/material';
import { Download, GitHub, Description } from '@mui/icons-material';

interface ApiDocsPageProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

const ApiDocsPage: NextPage<ApiDocsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load OpenAPI specification
    fetch('/openapi.yaml')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load API specification');
        return res.text();
      })
      .then(yamlText => {
        // Parse YAML (in production, use a proper YAML parser)
        setSpec(yamlText);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([spec], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gacp-openapi.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading API documentation...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>API Documentation - GACP Certify Flow</title>
        <meta name="description" content="GACP Certify Flow Admin Portal API Documentation" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            API Documentation
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Complete reference for the GACP Certify Flow Admin Portal REST API
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadSpec}>
              Download OpenAPI Spec
            </Button>
            <Button
              variant="outlined"
              startIcon={<GitHub />}
              href="https://github.com/gacp-certify/admin-portal"
              target="_blank"
            >
              View on GitHub
            </Button>
            <Button
              variant="outlined"
              startIcon={<Description />}
              href="/docs/API_DOCUMENTATION.md"
              target="_blank"
            >
              Full Documentation
            </Button>
          </Box>
        </Box>

        {/* Info Alert */}
        {!user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You are viewing the public API documentation. Some endpoints require authentication.
            Please log in to test authenticated endpoints.
          </Alert>
        )}

        {user && (
          <Alert severity="success" sx={{ mb: 3 }}>
            You are logged in as <strong>{user.email}</strong> ({user.role}). You can test
            authenticated endpoints using the "Try it out" feature.
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Interactive API Explorer" />
            <Tab label="Quick Start" />
            <Tab label="Authentication" />
            <Tab label="Examples" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <SwaggerUI
              url="/openapi.yaml"
              docExpansion="list"
              defaultModelsExpandDepth={1}
              displayRequestDuration={true}
              filter={true}
              showExtensions={true}
              showCommonExtensions={true}
              tryItOutEnabled={true}
              requestInterceptor={req => {
                // Add authentication token if user is logged in
                if (user) {
                  // In production, get actual token from session
                  const token = sessionStorage.getItem('accessToken');
                  if (token) {
                    req.headers.Authorization = `Bearer ${token}`;
                  }
                }
                return req;
              }}
            />
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Start
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              1. Authentication
            </Typography>
            <Typography paragraph>First, authenticate to receive an access token:</Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              {`curl -X POST https://api.gacp-certify.com/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              2. Make API Request
            </Typography>
            <Typography paragraph>Use the access token in subsequent requests:</Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              {`curl -X GET https://api.gacp-certify.com/v1/applications \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              3. Handle Responses
            </Typography>
            <Typography paragraph>All responses follow a consistent format:</Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              {`{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}`}
            </Paper>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Authentication
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              JWT Bearer Authentication
            </Typography>
            <Typography paragraph>
              The API uses JWT (JSON Web Tokens) for authentication. Include the token in the
              Authorization header:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', fontSize: '0.875rem' }}>
              Authorization: Bearer &lt;your_access_token&gt;
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Token Expiration
            </Typography>
            <ul>
              <li>
                <Typography>
                  <strong>Access Token:</strong> Expires in 15 minutes
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>Refresh Token:</strong> Expires in 7 days
                </Typography>
              </li>
            </ul>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Refreshing Tokens
            </Typography>
            <Typography paragraph>
              When your access token expires, use the refresh token to get a new one:
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              {`curl -X POST https://api.gacp-certify.com/v1/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Security Best Practices
            </Typography>
            <ul>
              <li>
                <Typography>Never expose tokens in client-side code</Typography>
              </li>
              <li>
                <Typography>Store tokens securely (httpOnly cookies or secure storage)</Typography>
              </li>
              <li>
                <Typography>Implement token refresh logic before expiration</Typography>
              </li>
              <li>
                <Typography>Use HTTPS for all API requests</Typography>
              </li>
              <li>
                <Typography>Invalidate tokens on logout</Typography>
              </li>
            </ul>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Code Examples
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              JavaScript/Node.js
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {`// Using fetch API
const response = await fetch('https://api.gacp-certify.com/v1/applications', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Using axios
const axios = require('axios');

const response = await axios.get('https://api.gacp-certify.com/v1/applications', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});

console.log(response.data);`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Python
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {`import requests

# Authenticate
response = requests.post(
    'https://api.gacp-certify.com/v1/auth/login',
    json={
        'email': 'admin@example.com',
        'password': 'your_password'
    }
)

access_token = response.json()['data']['accessToken']

# Make API request
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get(
    'https://api.gacp-certify.com/v1/applications',
    headers=headers
)

print(response.json())`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              PHP
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {`<?php
$ch = curl_init();

// Authenticate
curl_setopt($ch, CURLOPT_URL, 'https://api.gacp-certify.com/v1/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@example.com',
    'password' => 'your_password'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$data = json_decode($response, true);
$accessToken = $data['data']['accessToken'];

// Make API request
curl_setopt($ch, CURLOPT_URL, 'https://api.gacp-certify.com/v1/applications');
curl_setopt($ch, CURLOPT_HTTPGET, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $accessToken"
]);

$response = curl_exec($ch);
curl_close($ch);

print_r(json_decode($response, true));
?>`}
            </Paper>

            <Typography variant="h6" sx={{ mt: 3 }}>
              cURL
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {`# List applications
curl -X GET "https://api.gacp-certify.com/v1/applications?page=1&pageSize=20" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create application
curl -X POST https://api.gacp-certify.com/v1/applications \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "farmName": "Green Valley Farm",
    "farmerName": "John Doe",
    "farmAddress": "123 Farm Road",
    "farmSize": 10.5,
    "cropType": "Rice"
  }'

# Upload document
curl -X POST https://api.gacp-certify.com/v1/documents/upload \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -F "file=@/path/to/document.pdf" \\
  -F "applicationId=123e4567-e89b-12d3-a456-426614174000" \\
  -F "type=LAND_DEED"`}
            </Paper>
          </Paper>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getSession(context);

  return {
    props: {
      user: session?.user || null,
    },
  };
};

export default ApiDocsPage;
