# Google Calendar Integration Setup

## ✅ Configuration Required

Configure your Google Calendar integration with credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Client ID**: Get from Google Cloud Console
- **Client Secret**: Get from Google Cloud Console
- **Project**: Your Google Cloud project

## 🔧 Required Setup in Google Cloud Console

### 1. Configure Redirect URIs

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add these Redirect URIs to your OAuth 2.0 Client:

**For Development:**

```
http://localhost:3000/api/calendar/google/callback
http://localhost:5173/api/calendar/google/callback
```

**For Production:**

```
https://your-domain.com/api/calendar/google/callback
https://api.your-domain.com/calendar/google/callback
```

### 2. Enable Google Calendar API

1. Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/library)
2. Search for "Google Calendar API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
3. Add test users if in "Testing" mode

## 📋 Environment Variables

Add these to your `.env` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
```

## 🚀 How to Use

### For Inspectors:

**1. Enable Google Calendar Sync**

```bash
GET /api/calendar/google/auth
# Returns authorization URL
```

**2. User clicks URL and authorizes**

- Redirects to Google OAuth page
- User grants calendar permissions
- Redirects back to callback URL

**3. Check Sync Status**

```bash
GET /api/calendar/google/sync/status
```

**4. Manual Sync**

```bash
POST /api/calendar/google/sync/now
# Triggers bidirectional sync
```

**5. Disable Sync**

```bash
POST /api/calendar/google/sync/disable
```

## 🔄 Automatic Sync

Events are automatically synced when:

- Inspector creates/updates/deletes an event in GACP system
- Background job runs (every 1 hour by default)
- Manual sync is triggered

## 📊 API Endpoints Added

| Method | Endpoint                            | Description            |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/calendar/google/auth`         | Get OAuth URL          |
| GET    | `/api/calendar/google/callback`     | OAuth callback handler |
| POST   | `/api/calendar/google/sync/enable`  | Enable sync            |
| POST   | `/api/calendar/google/sync/disable` | Disable sync           |
| POST   | `/api/calendar/google/sync/now`     | Trigger sync           |
| GET    | `/api/calendar/google/sync/status`  | Get sync status        |

## 🔐 Security Notes

1. **Token Encryption**: In production, encrypt tokens before storing in database
2. **HTTPS**: Always use HTTPS in production for OAuth redirects
3. **Refresh Tokens**: System automatically refreshes expired tokens
4. **Scopes**: Only request necessary calendar permissions

## 🧪 Testing

**Test OAuth Flow:**

1. Start backend server
2. Open browser: `http://localhost:3000/api/calendar/google/auth`
3. Complete Google authorization
4. Verify redirect to callback with code
5. Check inspector availability has sync enabled

## 📝 Files Created

- `config/google-calendar.config.js` - Configuration
- `apps/backend/services/google-calendar.service.js` - Integration service
- Updated `apps/backend/routes/calendar.routes.js` - 6 new endpoints

## 🎯 Next Steps

1. ✅ Install package: `npm install googleapis`
2. ✅ Add environment variables to `.env`
3. ✅ Configure Google Cloud Console (redirect URIs + enable API)
4. ✅ Test OAuth flow with an inspector account
5. ✅ Set up cron job for automatic sync (optional)

## 🐛 Troubleshooting

**Error: redirect_uri_mismatch**

- Check redirect URI exactly matches in Google Console
- Include trailing slash or not (must match exactly)

**Error: invalid_grant**

- Token expired or revoked
- User needs to re-authorize

**Error: insufficient permissions**

- Check OAuth scopes are approved
- User may need to re-authorize with new scopes

## 📚 Reference

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
