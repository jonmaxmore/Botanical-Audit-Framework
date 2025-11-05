# 🔓 How to Open Security Group Port 5000

**Status:** ⏳ Pending Manual Configuration  
**Required for:** External API Access  
**Estimated Time:** 2-3 minutes

---

## 📋 Prerequisites

- ✅ AWS Console access
- ✅ EC2 instance running at `13.214.217.1`
- ✅ Backend application running (PM2 status: online)

---

## 🚀 Step-by-Step Instructions

### Step 1: Open AWS Console

1. Open your browser
2. Navigate to: **https://ap-southeast-1.console.aws.amazon.com/ec2/**
3. Sign in to your AWS account if prompted

### Step 2: Find Your Instance

1. In the left sidebar, click **"Instances"**
2. Look for the instance with Public IP: `13.214.217.1`
3. Click on the **Instance ID** to select it

### Step 3: Access Security Groups

1. In the bottom panel, click the **"Security"** tab
2. Under "Security groups", you'll see one or more security group names
3. Click on the **Security group name** (it's a blue link)

### Step 4: Edit Inbound Rules

1. Click the **"Inbound rules"** tab
2. Click the **"Edit inbound rules"** button (top right)
3. Click **"Add rule"**

### Step 5: Configure the New Rule

Fill in the following details:

```
┌─────────────────────────────────────────────────────┐
│ Type:          Custom TCP                           │
│ Protocol:      TCP                                  │
│ Port range:    5000                                 │
│ Source type:   Anywhere-IPv4                        │
│ Source:        0.0.0.0/0                           │
│ Description:   Backend API HTTP (optional)          │
└─────────────────────────────────────────────────────┘
```

**Important Notes:**

- **Type:** Select "Custom TCP" from dropdown
- **Port range:** Enter exactly `5000`
- **Source:** Using `0.0.0.0/0` allows access from anywhere
  - For better security, you can restrict to specific IPs
  - Example: `203.0.113.0/24` for a specific network
  - Example: `Your.Public.IP.Address/32` for just your IP

### Step 6: Save the Rule

1. Review your settings
2. Click **"Save rules"** button (bottom right)
3. Wait for the confirmation message

---

## ✅ Verification

After saving, you should see the new rule in the list:

```
Type        Protocol   Port Range   Source        Description
─────────────────────────────────────────────────────────────
Custom TCP  TCP        5000         0.0.0.0/0    Backend API HTTP
SSH         TCP        22           0.0.0.0/0    SSH Access
```

---

## 🧪 Test the Configuration

### Option 1: Run the Test Script (Recommended)

```powershell
.\test-api-external.ps1
```

This will automatically test:

- ✅ Port connectivity
- ✅ Health endpoint
- ✅ Status endpoint
- ✅ Authentication check

### Option 2: Manual Testing

#### Test 1: Port Connectivity

```powershell
Test-NetConnection -ComputerName 13.214.217.1 -Port 5000
```

Expected result: `TcpTestSucceeded : True`

#### Test 2: API Health Check

```powershell
curl http://13.214.217.1:5000/api/health
```

Expected result: `{"status":"healthy",...}`

#### Test 3: Browser Test

Open in your browser:

```
http://13.214.217.1:5000/api/health
```

You should see JSON response with health status.

---

## 🔒 Security Considerations

### Using 0.0.0.0/0 (Anywhere)

**Pros:**

- ✅ Accessible from any location
- ✅ Good for public APIs
- ✅ Easy for testing and development

**Cons:**

- ⚠️ Exposed to the entire internet
- ⚠️ More vulnerable to attacks
- ⚠️ Should implement rate limiting

### Using Specific IP Ranges (Recommended for Production)

**Option A: Your Office/Home IP**

```
Source: Your.Public.IP.Address/32
Description: Office network only
```

**Option B: Your Company Network**

```
Source: 203.0.113.0/24
Description: Company network range
```

**Option C: Multiple Sources**
Add multiple rules for different authorized IPs

### Additional Security Recommendations

1. **Enable HTTPS (Port 443)**
   - Use AWS Certificate Manager
   - Set up Application Load Balancer
   - Or configure nginx with Let's Encrypt

2. **Implement Rate Limiting**
   - Use AWS WAF (Web Application Firewall)
   - Or configure rate limiting in nginx

3. **Monitor Access Logs**
   - Enable CloudWatch logs
   - Set up alerts for suspicious activity

4. **Use Authentication**
   - JWT tokens (already implemented ✅)
   - API keys for external services

---

## 🐛 Troubleshooting

### Problem: Port test still fails after opening Security Group

**Possible causes:**

1. **Network ACL blocking**: Check VPC Network ACLs
2. **Instance firewall**: Check OS-level firewall rules
3. **Application not listening**: Verify PM2 status
4. **Wrong port**: Ensure app is actually on port 5000

**Debug commands:**

```bash
# SSH to instance
ssh -i C:\Users\usEr\.ssh\gacp-backend-server.pem ec2-user@13.214.217.1

# Check if app is listening on port 5000
sudo netstat -tlnp | grep 5000

# Check PM2 status
pm2 status

# Check application logs
pm2 logs backend --lines 50
```

### Problem: Connection times out

**Check:**

1. Security Group rule saved correctly
2. Instance is in "running" state
3. Public IP hasn't changed
4. Your local firewall allows outbound connections

### Problem: 401 Unauthorized on /api/applications

**This is expected!**

- The endpoint requires authentication
- Get a JWT token first:
  ```bash
  POST http://13.214.217.1:5000/api/auth/login
  Body: {"email": "...", "password": "..."}
  ```

---

## 📞 Need Help?

### Useful AWS Documentation

- [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)
- [Troubleshooting](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/troubleshooting-connect.html)

### Check Current Status

```bash
# On EC2 instance
ssh -i C:\Users\usEr\.ssh\gacp-backend-server.pem ec2-user@13.214.217.1 "pm2 status && curl -s http://localhost:5000/api/health | jq"
```

---

## ✨ Success Criteria

When everything is working correctly, you should see:

```
✅ Port 5000 is OPEN
✅ Health Status: healthy
✅ MongoDB: healthy
✅ Server Status: ok
✅ Authentication required (401) - Expected behavior
```

---

**Once port 5000 is open, your API will be publicly accessible at:**

```
http://13.214.217.1:5000
```

**Remember to:**

- Document any API keys or tokens securely
- Set up monitoring and alerts
- Plan for HTTPS implementation
- Consider rate limiting for production

---

**Last Updated:** November 5, 2025  
**Status:** Waiting for Security Group configuration  
**Next Step:** Run `.\test-api-external.ps1` after opening port
