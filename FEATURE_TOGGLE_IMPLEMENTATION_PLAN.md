# 🎛️ Feature Toggle System - Implementation Plan

## 📋 Overview

ระบบควบคุมการเปิด/ปิด Services แบบ Dynamic โดยไม่ต้อง restart server พร้อมรองรับ SaaS/Subscription model

---

## 🗄️ Database Schema

### Collection: `feature_toggles`

```javascript
{
  _id: ObjectId("..."),
  serviceId: "traceability",
  serviceName: "ระบบติดตามย้อนกลับ",
  serviceNameEn: "Traceability System",
  enabled: true,
  canDisable: true,
  category: "optional", // "core" | "optional" | "premium"
  
  // Routing
  routes: [
    "/api/track-trace/*",
    "/api/traceability/*"
  ],
  
  // Pricing (for future subscription)
  pricing: {
    tier: "professional", // "free" | "professional" | "enterprise"
    monthlyPrice: 5000,
    perUsagePrice: 10,
    currency: "THB"
  },
  
  // Dependencies
  dependencies: ["member"], // serviceIds that must be enabled
  
  // Feature flags
  features: {
    qrCodeGeneration: true,
    publicLookup: true,
    batchTracking: true,
    apiAccess: false
  },
  
  // Metadata
  metadata: {
    description: "ติดตามสินค้าด้วย QR Code และ Batch Code",
    icon: "qr_code_scanner",
    displayOrder: 3,
    createdAt: ISODate("2025-01-01T00:00:00Z"),
    updatedAt: ISODate("2025-01-15T10:30:00Z"),
    lastToggledAt: ISODate("2025-01-15T10:30:00Z"),
    lastToggledBy: ObjectId("admin_user_id")
  },
  
  // Usage tracking (for billing)
  usage: {
    enabled: true,
    metrics: ["api_calls", "qr_scans", "products_tracked"],
    limits: {
      api_calls: 10000, // per month
      qr_scans: 1000,
      products_tracked: 100
    }
  }
}
```

### Collection: `service_usage` (for billing)

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  serviceId: "traceability",
  period: "2025-01",
  usage: {
    api_calls: 5234,
    qr_scans: 456,
    products_tracked: 45
  },
  costs: {
    base: 5000,
    overage: 120,
    total: 5120
  },
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-31T23:59:59Z")
}
```

---

## 🔧 Implementation Files

### 1. Model: `models/FeatureToggle.js`

```javascript
const mongoose = require('mongoose');

const featureToggleSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  serviceName: { type: String, required: true },
  serviceNameEn: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  canDisable: { type: Boolean, default: true },
  category: {
    type: String,
    enum: ['core', 'optional', 'premium'],
    default: 'optional'
  },
  routes: [{ type: String }],
  pricing: {
    tier: {
      type: String,
      enum: ['free', 'professional', 'enterprise'],
      default: 'professional'
    },
    monthlyPrice: { type: Number, default: 0 },
    perUsagePrice: { type: Number, default: 0 },
    currency: { type: String, default: 'THB' }
  },
  dependencies: [{ type: String }],
  features: { type: Map, of: Boolean },
  metadata: {
    description: String,
    icon: String,
    displayOrder: Number,
    lastToggledAt: Date,
    lastToggledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  usage: {
    enabled: { type: Boolean, default: false },
    metrics: [{ type: String }],
    limits: { type: Map, of: Number }
  }
}, {
  timestamps: true
});

// Method: Check if service can be toggled
featureToggleSchema.methods.canToggle = function() {
  return this.canDisable && this.category !== 'core';
};

// Static: Get enabled services
featureToggleSchema.statics.getEnabledServices = async function() {
  return await this.find({ enabled: true }).select('serviceId serviceName routes');
};

// Static: Check if route is enabled
featureToggleSchema.statics.isRouteEnabled = async function(route) {
  const services = await this.find({ enabled: true });
  return services.some(service => 
    service.routes.some(r => {
      const pattern = r.replace('*', '.*');
      return new RegExp(`^${pattern}$`).test(route);
    })
  );
};

module.exports = mongoose.model('FeatureToggle', featureToggleSchema);
```

---

### 2. Middleware: `middleware/feature-toggle.js`

```javascript
const FeatureToggle = require('../models/FeatureToggle');
const logger = require('../shared/logger');

// Cache for performance
let featureCache = new Map();
let cacheExpiry = Date.now();
const CACHE_TTL = 60000; // 1 minute

/**
 * Refresh feature cache
 */
async function refreshCache() {
  try {
    const features = await FeatureToggle.find({ enabled: true });
    featureCache.clear();
    
    features.forEach(feature => {
      feature.routes.forEach(route => {
        const pattern = route.replace(/\*/g, '.*');
        featureCache.set(route, {
          serviceId: feature.serviceId,
          pattern: new RegExp(`^${pattern}$`),
          enabled: feature.enabled
        });
      });
    });
    
    cacheExpiry = Date.now() + CACHE_TTL;
    logger.info(`Feature cache refreshed: ${featureCache.size} routes`);
  } catch (error) {
    logger.error('Failed to refresh feature cache:', error);
  }
}

/**
 * Check if route is enabled
 */
function isRouteEnabled(path) {
  // Refresh cache if expired
  if (Date.now() > cacheExpiry) {
    refreshCache().catch(err => logger.error('Cache refresh error:', err));
  }
  
  // Check cache
  for (const [route, config] of featureCache.entries()) {
    if (config.pattern.test(path)) {
      return config.enabled;
    }
  }
  
  // Default: allow if not found (for core routes)
  return true;
}

/**
 * Middleware: Check feature toggle
 */
const checkFeatureEnabled = (serviceId) => {
  return async (req, res, next) => {
    try {
      // Check if route is enabled
      if (!isRouteEnabled(req.path)) {
        return res.status(403).json({
          success: false,
          error: 'SERVICE_DISABLED',
          message: 'This service is currently disabled',
          serviceId,
          contactSupport: true
        });
      }
      
      next();
    } catch (error) {
      logger.error('Feature toggle check error:', error);
      // Fail open: allow request if check fails
      next();
    }
  };
};

/**
 * Middleware: Global feature check
 */
const globalFeatureCheck = async (req, res, next) => {
  try {
    // Skip for health checks and public routes
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }
    
    // Check if route is enabled
    if (!isRouteEnabled(req.path)) {
      return res.status(403).json({
        success: false,
        error: 'SERVICE_DISABLED',
        message: 'This service is currently disabled',
        path: req.path
      });
    }
    
    next();
  } catch (error) {
    logger.error('Global feature check error:', error);
    next();
  }
};

// Initialize cache on startup
refreshCache();

module.exports = {
  checkFeatureEnabled,
  globalFeatureCheck,
  refreshCache,
  isRouteEnabled
};
```

---

### 3. Service: `services/feature-toggle.service.js`

```javascript
const FeatureToggle = require('../models/FeatureToggle');
const { refreshCache } = require('../middleware/feature-toggle');
const logger = require('../shared/logger');

class FeatureToggleService {
  /**
   * Toggle service on/off
   */
  async toggleService(serviceId, enabled, userId) {
    const feature = await FeatureToggle.findOne({ serviceId });
    
    if (!feature) {
      throw new Error(`Service ${serviceId} not found`);
    }
    
    if (!feature.canToggle()) {
      throw new Error(`Service ${serviceId} cannot be disabled (core service)`);
    }
    
    // Check dependencies
    if (enabled) {
      await this.checkDependencies(feature.dependencies);
    }
    
    feature.enabled = enabled;
    feature.metadata.lastToggledAt = new Date();
    feature.metadata.lastToggledBy = userId;
    
    await feature.save();
    await refreshCache();
    
    logger.info(`Service ${serviceId} ${enabled ? 'enabled' : 'disabled'} by ${userId}`);
    
    return feature;
  }
  
  /**
   * Check if dependencies are enabled
   */
  async checkDependencies(dependencies) {
    if (!dependencies || dependencies.length === 0) return true;
    
    for (const depId of dependencies) {
      const dep = await FeatureToggle.findOne({ serviceId: depId });
      if (!dep || !dep.enabled) {
        throw new Error(`Dependency ${depId} is not enabled`);
      }
    }
    
    return true;
  }
  
  /**
   * Get all services
   */
  async getAllServices() {
    return await FeatureToggle.find().sort({ 'metadata.displayOrder': 1 });
  }
  
  /**
   * Get enabled services
   */
  async getEnabledServices() {
    return await FeatureToggle.find({ enabled: true });
  }
  
  /**
   * Initialize default features
   */
  async initializeDefaults() {
    const defaults = [
      {
        serviceId: 'member',
        serviceName: 'ระบบสมาชิก',
        serviceNameEn: 'Member Management',
        enabled: true,
        canDisable: false,
        category: 'core',
        routes: ['/api/auth/*', '/api/users/*'],
        metadata: { displayOrder: 1, description: 'ระบบจัดการสมาชิกและ Authentication' }
      },
      {
        serviceId: 'license',
        serviceName: 'ระบบยื่นเอกสารขออนุญาต',
        serviceNameEn: 'License Application',
        enabled: true,
        canDisable: false,
        category: 'core',
        routes: ['/api/applications/*', '/api/certificates/*'],
        metadata: { displayOrder: 2, description: 'ระบบยื่นและอนุมัติใบอนุญาต' }
      },
      {
        serviceId: 'traceability',
        serviceName: 'ระบบติดตามย้อนกลับ',
        serviceNameEn: 'Traceability System',
        enabled: true,
        canDisable: true,
        category: 'optional',
        routes: ['/api/track-trace/*', '/api/traceability/*'],
        pricing: { tier: 'professional', monthlyPrice: 5000, perUsagePrice: 10 },
        dependencies: ['member'],
        metadata: { displayOrder: 3, description: 'ติดตามสินค้าด้วย QR Code' }
      },
      {
        serviceId: 'farmManagement',
        serviceName: 'ระบบบริหารจัดการฟาร์ม',
        serviceNameEn: 'Farm Management',
        enabled: true,
        canDisable: true,
        category: 'optional',
        routes: ['/api/farm/*'],
        pricing: { tier: 'professional', monthlyPrice: 5000 },
        dependencies: ['member'],
        metadata: { displayOrder: 4, description: 'จัดการ Cultivation Cycles และ SOP' }
      },
      {
        serviceId: 'survey',
        serviceName: 'ระบบแบบสอบถาม',
        serviceNameEn: 'Survey System',
        enabled: false,
        canDisable: true,
        category: 'optional',
        routes: ['/api/surveys/*'],
        pricing: { tier: 'professional', monthlyPrice: 3000 },
        dependencies: ['member'],
        metadata: { displayOrder: 5, description: 'Survey Wizard 4 ภูมิภาค' }
      },
      {
        serviceId: 'standardComparison',
        serviceName: 'ระบบเปรียบเทียบมาตรฐาน',
        serviceNameEn: 'Standard Comparison',
        enabled: false,
        canDisable: true,
        category: 'premium',
        routes: ['/api/standards/*', '/api/compliance/*'],
        pricing: { tier: 'enterprise', monthlyPrice: 8000 },
        metadata: { displayOrder: 6, description: 'เปรียบเทียบ GACP vs WHO/FDA/ASEAN' }
      }
    ];
    
    for (const def of defaults) {
      await FeatureToggle.findOneAndUpdate(
        { serviceId: def.serviceId },
        def,
        { upsert: true, new: true }
      );
    }
    
    await refreshCache();
    logger.info('Feature toggles initialized');
  }
}

module.exports = new FeatureToggleService();
```

---

### 4. Routes: `routes/feature-toggle.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const featureToggleService = require('../services/feature-toggle.service');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/admin/features
 * Get all feature toggles
 */
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const features = await featureToggleService.getAllServices();
    res.json({ success: true, data: features });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/features/:serviceId/toggle
 * Toggle service on/off
 */
router.post('/:serviceId/toggle', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { enabled } = req.body;
    
    const feature = await featureToggleService.toggleService(
      serviceId,
      enabled,
      req.user.id
    );
    
    res.json({
      success: true,
      message: `Service ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: feature
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/features/initialize
 * Initialize default features
 */
router.post('/initialize', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await featureToggleService.initializeDefaults();
    res.json({ success: true, message: 'Features initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

## 🎨 Admin UI Component (React)

```typescript
// components/FeatureTogglePanel.tsx
import React, { useState, useEffect } from 'react';
import { Switch, Card, Alert, Chip } from '@mui/material';

interface Feature {
  serviceId: string;
  serviceName: string;
  enabled: boolean;
  canDisable: boolean;
  category: 'core' | 'optional' | 'premium';
  pricing?: {
    monthlyPrice: number;
  };
}

export const FeatureTogglePanel: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  
  const handleToggle = async (serviceId: string, enabled: boolean) => {
    try {
      await fetch(`/api/admin/features/${serviceId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      // Refresh list
      loadFeatures();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };
  
  return (
    <div className="feature-toggle-panel">
      <h2>Service Management</h2>
      
      {features.map(feature => (
        <Card key={feature.serviceId} className="feature-card">
          <div className="feature-header">
            <h3>{feature.serviceName}</h3>
            <Chip 
              label={feature.category} 
              color={feature.category === 'core' ? 'primary' : 'default'}
            />
          </div>
          
          <div className="feature-controls">
            <Switch
              checked={feature.enabled}
              disabled={!feature.canDisable}
              onChange={(e) => handleToggle(feature.serviceId, e.target.checked)}
            />
            
            {feature.pricing && (
              <span className="price">
                ฿{feature.pricing.monthlyPrice}/month
              </span>
            )}
          </div>
          
          {!feature.canDisable && (
            <Alert severity="info">Core service - cannot be disabled</Alert>
          )}
        </Card>
      ))}
    </div>
  );
};
```

---

## 📝 Implementation Checklist

### Phase 1: Basic Toggle (1-2 days)
- [ ] สร้าง FeatureToggle Model
- [ ] สร้าง Middleware
- [ ] สร้าง Service
- [ ] สร้าง Admin Routes
- [ ] Initialize default features
- [ ] ทดสอบการเปิด/ปิด

### Phase 2: Admin UI (1-2 days)
- [ ] สร้าง Feature Toggle Panel
- [ ] เพิ่มใน Admin Portal
- [ ] ทดสอบ UI

### Phase 3: Testing (1 day)
- [ ] ทดสอบ Dependencies
- [ ] ทดสอบ Cache
- [ ] ทดสอบ Performance
- [ ] ทดสอบ Edge Cases

---

**Total Effort:** 3-5 days
**Priority:** High (สำหรับ SaaS model)
