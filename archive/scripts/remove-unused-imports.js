const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    file: 'apps/backend/routes/cannabis-surveys.js',
    remove: ["const { _CannabisQuestion } = require('../models/CannabisQuestion');"]
  },
  {
    file: 'apps/backend/services/cannabis-survey-integration.js',
    remove: [
      "const { _CannabisQuestion } = require('../models/CannabisQuestion');",
      "const cannabisSurveyService = require('./cannabis-survey');"
    ]
  },
  {
    file: 'apps/backend/services/cannabis-survey.js',
    remove: [
      "const Farm = require('../models/Farm');",
      "const EnhancedCultivationRecord = require('../models/EnhancedCultivationRecord');",
      "const mongoose = require('mongoose');"
    ]
  },
  {
    file: 'apps/backend/services/cannabis-survey-initializer.js',
    remove: ["const mongoose = require('mongoose');"]
  },
  {
    file: 'apps/backend/modules/application/index.js',
    remove: [
      "const path = require('path');",
      "const fs = require('fs');",
      "const express = require('express');"
    ]
  },
  {
    file: 'apps/backend/modules/application/config/index.js',
    remove: ["const fs = require('fs');"]
  },
  {
    file: 'apps/backend/modules/document-management/domain/DocumentManagementService.js',
    remove: ["const fs = require('fs');"]
  },
  {
    file: 'apps/backend/modules/notification-service/application/services/NotificationService.js',
    remove: ["const path = require('path');", "const fs = require('fs');"]
  },
  {
    file: 'apps/backend/modules/notification-service/index.js',
    remove: ["const Notification = require('./infrastructure/database/notification');"]
  },
  {
    file: 'apps/backend/modules/auth-dtam/models/DTAMStaff.js',
    remove: ["const shared = require('../../shared/constants/roles');"]
  },
  {
    file: 'apps/backend/modules/auth-dtam/routes/dtam-auth.js',
    remove: ["const bcrypt = require('bcrypt');"]
  },
  {
    file: 'apps/backend/modules/auth-dtam/middleware/dtam-auth.js',
    remove: ["const jwt = require('jsonwebtoken');"]
  },
  {
    file: 'apps/backend/modules/farm-management/services/farm-management.service.js',
    remove: ["const CultivationCycle = require('../../../models/CultivationCycle');"]
  },
  {
    file: 'apps/backend/modules/farm-management/controllers/farm-management.controller.js',
    remove: ["const FarmManagementService = require('../services/farm-management.service');"]
  },
  {
    file: 'apps/backend/modules/application-workflow/controllers/application-workflow.controller.js',
    remove: ["const ApplicationWorkflowService = require('../services/application-workflow.service');"]
  },
  {
    file: 'apps/backend/modules/survey-system/controllers/survey-system.controller.js',
    remove: ["const SurveySystemService = require('../services/survey-system.service');"]
  },
  {
    file: 'apps/backend/modules/survey-system/services/survey-system.service.js',
    remove: ["const { v4: uuidv4 } = require('uuid');"]
  },
  {
    file: 'apps/backend/modules/track-trace/controllers/track-trace.controller.js',
    remove: ["const TrackTraceService = require('../services/track-trace.service');"]
  },
  {
    file: 'apps/backend/modules/reporting-analytics/application/services/DashboardService.js',
    remove: ["const moment = require('moment');"]
  }
];

console.log('🗑️  กำลังลบ unused imports...\n');

let fixed = 0;
let failed = 0;

filesToFix.forEach(({ file, remove }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ไม่พบไฟล์: ${file}`);
      failed++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    remove.forEach(line => {
      const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}\\s*\\n`, 'gm');
      if (content.match(regex)) {
        content = content.replace(regex, '');
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file}`);
      fixed++;
    }
  } catch (error) {
    console.log(`❌ Error in ${file}: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 สรุป: แก้ไขสำเร็จ ${fixed} ไฟล์, ล้มเหลว ${failed} ไฟล์`);
