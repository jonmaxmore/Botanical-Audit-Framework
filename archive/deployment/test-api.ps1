#!/usr/bin/env pwsh
# Notification System API Testing Script
# Run with: .\test-api.ps1

Write-Host "`n=== GACP Notification System API Testing ===" -ForegroundColor Cyan
Write-Host "Testing REST API endpoints...`n" -ForegroundColor Yellow

# Configuration
$BASE_URL = "http://localhost:3001"
$AUTH_TOKEN = Read-Host "Enter your JWT token (or press Enter to skip auth tests)"

# Test counter
$TestsPassed = 0
$TestsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -NoNewline
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host " [PASS]" -ForegroundColor Green
        $script:TestsPassed++
        return $response
    }
    catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:TestsFailed++
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n--- Basic Connectivity ---" -ForegroundColor Cyan
Test-Endpoint -Name "Server Health Check" -Method "GET" -Endpoint "/health"

if (-not $AUTH_TOKEN) {
    Write-Host "`nSkipping authenticated tests (no token provided)" -ForegroundColor Yellow
    Write-Host "`nTo run full tests, restart with a valid JWT token" -ForegroundColor Yellow
    exit 0
}

$authHeaders = @{
    "Authorization" = "Bearer $AUTH_TOKEN"
}

# Test 2: Get Notifications
Write-Host "`n--- Notification Retrieval ---" -ForegroundColor Cyan
$notifications = Test-Endpoint -Name "GET /api/notifications" -Method "GET" -Endpoint "/api/notifications" -Headers $authHeaders

if ($notifications) {
    Write-Host "  → Found $($notifications.data.notifications.Count) notifications" -ForegroundColor Gray
}

# Test 3: Get Unread Count
$unreadCount = Test-Endpoint -Name "GET /api/notifications/unread-count" -Method "GET" -Endpoint "/api/notifications/unread-count" -Headers $authHeaders

if ($unreadCount) {
    Write-Host "  → Unread count: $($unreadCount.data.count)" -ForegroundColor Gray
}

# Test 4: Get with Pagination
Test-Endpoint -Name "GET /api/notifications?page=1&limit=5" -Method "GET" -Endpoint "/api/notifications?page=1&limit=5" -Headers $authHeaders

# Test 5: Get with Filters
Test-Endpoint -Name "GET /api/notifications?isRead=false" -Method "GET" -Endpoint "/api/notifications?isRead=false" -Headers $authHeaders

Test-Endpoint -Name "GET /api/notifications?priority=high" -Method "GET" -Endpoint "/api/notifications?priority=high" -Headers $authHeaders

# Test 6: Get Notification Types
Write-Host "`n--- Notification Configuration ---" -ForegroundColor Cyan
$types = Test-Endpoint -Name "GET /api/notifications/types" -Method "GET" -Endpoint "/api/notifications/types" -Headers $authHeaders

if ($types) {
    Write-Host "  → Available types: $($types.data.types.Count)" -ForegroundColor Gray
}

# Test 7: Get Preferences
$preferences = Test-Endpoint -Name "GET /api/notifications/preferences" -Method "GET" -Endpoint "/api/notifications/preferences" -Headers $authHeaders

if ($preferences) {
    Write-Host "  → Email enabled: $($preferences.data.email)" -ForegroundColor Gray
    Write-Host "  → Realtime enabled: $($preferences.data.realtime)" -ForegroundColor Gray
}

# Test 8: Update Preferences
Write-Host "`n--- Preference Updates ---" -ForegroundColor Cyan
$updatePrefs = @{
    email = $true
    realtime = $true
}
Test-Endpoint -Name "PUT /api/notifications/preferences" -Method "PUT" -Endpoint "/api/notifications/preferences" -Headers $authHeaders -Body $updatePrefs

# Test 9: Mark Notification as Read (if we have notifications)
if ($notifications -and $notifications.data.notifications.Count -gt 0) {
    Write-Host "`n--- Notification Actions ---" -ForegroundColor Cyan
    $firstNotifId = $notifications.data.notifications[0]._id
    
    Test-Endpoint -Name "PUT /api/notifications/:id/read" -Method "PUT" -Endpoint "/api/notifications/$firstNotifId/read" -Headers $authHeaders
}

# Test 10: Mark All as Read
Test-Endpoint -Name "PUT /api/notifications/read-all" -Method "PUT" -Endpoint "/api/notifications/read-all" -Headers $authHeaders

# Test 11: Test Notification Creation (Admin only)
Write-Host "`n--- Admin Tests (may require admin role) ---" -ForegroundColor Cyan
$testNotif = @{
    userId = "507f1f77bcf86cd799439011"
    type = "system_update"
    title = "API Test Notification"
    message = "This is a test notification from API testing script"
    priority = "low"
}
Test-Endpoint -Name "POST /api/notifications (admin)" -Method "POST" -Endpoint "/api/notifications" -Headers $authHeaders -Body $testNotif -ExpectedStatus 201

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Tests Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $TestsFailed" -ForegroundColor Red
Write-Host "Total Tests:  $($TestsPassed + $TestsFailed)`n"

if ($TestsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed. Check errors above." -ForegroundColor Red
}

# Socket.io Test Instructions
Write-Host "`n--- Socket.io Real-time Testing ---" -ForegroundColor Cyan
Write-Host "To test Socket.io, open browser console and run:" -ForegroundColor Yellow
Write-Host @"

const socket = io('http://localhost:3001', {
  auth: { 
    token: '$AUTH_TOKEN',
    userId: 'your-user-id'
  }
});

socket.on('connect', () => console.log('✓ Connected'));
socket.on('notification:new', (data) => console.log('✓ New notification:', data));
socket.on('notification:unread-count', (data) => console.log('✓ Unread count:', data.count));

"@ -ForegroundColor Gray

Write-Host "`nDone!`n" -ForegroundColor Cyan
