# GACP Platform - User Acceptance Testing (UAT) Plan 2025

**Created:** 2025-01-15  
**Duration:** 2 Weeks  
**Status:** 🆕 Ready to Start

---

## 🎯 UAT Objectives

1. Validate system meets business requirements
2. Ensure user-friendly interface and workflows
3. Identify usability issues before production
4. Gain user confidence and buy-in
5. Collect feedback for improvements

---

## 👥 UAT Participants

### Farmer Group (10 participants)
- 3 Cannabis farmers
- 2 Turmeric farmers
- 2 Ginger farmers
- 1 Black galingale farmer
- 1 Plai farmer
- 1 Kratom farmer

### DTAM Staff Group (8 participants)
- 2 Document reviewers
- 2 Field inspectors
- 2 Approvers
- 2 Certificate officers

### Total: 18 participants

---

## 📅 UAT Schedule

### Week 1: Training & Initial Testing
**Day 1-2: Training**
- System overview
- Feature demonstrations
- Hands-on practice
- Q&A sessions

**Day 3-5: Guided Testing**
- Execute test scenarios with support
- Document issues immediately
- Daily feedback sessions

### Week 2: Independent Testing & Feedback
**Day 6-8: Independent Testing**
- Users test on their own
- Real-world scenarios
- Minimal support

**Day 9-10: Feedback & Wrap-up**
- Collect final feedback
- Prioritize issues
- Plan fixes
- UAT sign-off

---

## 🧪 Test Scenarios

### Farmer Portal Scenarios

#### Scenario 1: New Application Submission
**Objective:** Submit a complete GACP application

**Steps:**
1. Register new account
2. Login to farmer portal
3. Navigate to "New Application"
4. Fill in farm details
5. Upload required documents:
   - Farm registration
   - Land ownership proof
   - ID card copy
   - Farm map
6. Review and submit
7. Pay first installment (5,000 THB)
8. Receive confirmation email

**Expected Result:** Application submitted successfully, payment confirmed

---

#### Scenario 2: Document Upload & Management
**Objective:** Upload and manage documents

**Steps:**
1. Login to farmer portal
2. Go to existing application
3. Upload additional documents
4. View document history
5. Download uploaded documents
6. Delete and re-upload document

**Expected Result:** All document operations work smoothly

---

#### Scenario 3: Payment Processing
**Objective:** Complete 2-stage payment

**Steps:**
1. Pay first installment (5,000 THB)
2. Receive payment confirmation
3. Wait for document approval
4. Pay second installment (25,000 THB)
5. Receive final payment confirmation

**Expected Result:** Both payments processed successfully

---

#### Scenario 4: Certificate Viewing
**Objective:** View and download certificate

**Steps:**
1. Login to farmer portal
2. Navigate to "My Certificates"
3. View certificate details
4. Download PDF certificate
5. View QR code
6. Share certificate link

**Expected Result:** Certificate accessible and downloadable

---

### Admin Portal Scenarios

#### Scenario 5: Document Review
**Objective:** Review and approve/reject documents

**Steps:**
1. Login as reviewer
2. View pending applications
3. Open application details
4. Review each document
5. Request additional documents (if needed)
6. Approve or reject with comments
7. Send notification to farmer

**Expected Result:** Review process completed, farmer notified

---

#### Scenario 6: Inspection Scheduling
**Objective:** Schedule field inspection

**Steps:**
1. Login as inspector
2. View assigned applications
3. Contact farmer
4. Schedule inspection date
5. Add to calendar
6. Send confirmation to farmer

**Expected Result:** Inspection scheduled, both parties notified

---

#### Scenario 7: Field Inspection
**Objective:** Conduct and document field inspection

**Steps:**
1. Access inspection checklist
2. Complete GACP criteria
3. Take photos/videos
4. Add notes and observations
5. Submit inspection report
6. Recommend approval/rejection

**Expected Result:** Inspection report submitted successfully

---

#### Scenario 8: Certificate Issuance
**Objective:** Issue GACP certificate

**Steps:**
1. Login as approver
2. Review complete application
3. Verify all requirements met
4. Approve certificate issuance
5. Generate certificate with QR code
6. Send to farmer
7. Update public registry

**Expected Result:** Certificate issued and farmer notified

---

### Certificate Portal Scenarios

#### Scenario 9: Public Verification
**Objective:** Verify certificate authenticity

**Steps:**
1. Access public verification page
2. Scan QR code or enter certificate number
3. View certificate details
4. Verify farm information
5. Check expiry date

**Expected Result:** Certificate verified successfully

---

## 📋 UAT Test Cases Template

| Test ID | Scenario | Steps | Expected Result | Actual Result | Status | Comments |
|---------|----------|-------|-----------------|---------------|--------|----------|
| UAT-001 | New Application | See Scenario 1 | Application submitted | | ⏳ | |
| UAT-002 | Document Upload | See Scenario 2 | Documents uploaded | | ⏳ | |
| UAT-003 | Payment | See Scenario 3 | Payment completed | | ⏳ | |
| UAT-004 | Certificate View | See Scenario 4 | Certificate viewed | | ⏳ | |
| UAT-005 | Document Review | See Scenario 5 | Review completed | | ⏳ | |
| UAT-006 | Inspection Schedule | See Scenario 6 | Inspection scheduled | | ⏳ | |
| UAT-007 | Field Inspection | See Scenario 7 | Report submitted | | ⏳ | |
| UAT-008 | Certificate Issue | See Scenario 8 | Certificate issued | | ⏳ | |
| UAT-009 | Public Verification | See Scenario 9 | Certificate verified | | ⏳ | |

---

## 📊 Feedback Collection

### Feedback Form Questions

**Usability (1-5 scale)**
1. How easy was it to navigate the system?
2. How clear were the instructions?
3. How intuitive was the interface?
4. How satisfied are you with the overall experience?

**Functionality (Yes/No)**
1. Did all features work as expected?
2. Were there any errors or bugs?
3. Was the system responsive?
4. Did you encounter any issues?

**Open-Ended Questions**
1. What did you like most about the system?
2. What frustrated you the most?
3. What features are missing?
4. What improvements would you suggest?

---

## 🐛 Issue Reporting

### Issue Report Template

**Issue ID:** UAT-BUG-XXX  
**Reported By:** [Name]  
**Date:** [Date]  
**Severity:** Critical / High / Medium / Low

**Description:**
[Detailed description of the issue]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Videos:**
[Attach if available]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile/Tablet]

---

## ✅ UAT Success Criteria

### Must Have (Go/No-Go)
- ✅ All critical features work
- ✅ No critical bugs
- ✅ All user workflows complete
- ✅ 80%+ user satisfaction
- ✅ Stakeholder sign-off

### Nice to Have
- ✅ 90%+ user satisfaction
- ✅ No high-priority bugs
- ✅ Positive user feedback
- ✅ Feature requests documented

---

## 📈 UAT Metrics

### Track These Metrics
- Number of test cases executed
- Pass/fail rate
- Number of bugs found (by severity)
- User satisfaction scores
- Time to complete scenarios
- Feature usage statistics

---

## 🎓 Training Materials

### Required Materials
- [ ] User manuals (Farmer, Admin, Certificate)
- [ ] Video tutorials
- [ ] Quick reference guides
- [ ] FAQ document
- [ ] Training presentation slides
- [ ] Sample data for practice

---

## 🔧 UAT Environment

### Setup Requirements
- **Test Server:** Separate from production
- **Test Database:** Pre-populated with sample data
- **Test Accounts:** Created for all participants
- **Test Data:** Realistic farm and application data
- **Support:** Dedicated support team available

### Test Accounts
- 10 Farmer accounts (farmer001@test.com - farmer010@test.com)
- 2 Reviewer accounts (reviewer001@test.com - reviewer002@test.com)
- 2 Inspector accounts (inspector001@test.com - inspector002@test.com)
- 2 Approver accounts (approver001@test.com - approver002@test.com)
- 2 Certificate Officer accounts (cert001@test.com - cert002@test.com)

---

## 📞 Support During UAT

### Support Team
- **Technical Support:** Available 9 AM - 6 PM
- **Business Support:** Available 9 AM - 5 PM
- **Emergency Contact:** 24/7 hotline

### Communication Channels
- **Email:** uat-support@gacp-platform.com
- **Phone:** 02-XXX-XXXX
- **LINE Group:** GACP UAT 2025
- **Slack Channel:** #gacp-uat

---

## 📝 UAT Sign-Off

### Sign-Off Checklist
- [ ] All test scenarios executed
- [ ] All critical bugs fixed
- [ ] User feedback collected and reviewed
- [ ] UAT report completed
- [ ] Stakeholder approval obtained
- [ ] Production deployment approved

### Sign-Off Form

**Project:** GACP Platform  
**UAT Period:** [Start Date] - [End Date]  
**UAT Lead:** [Name]

**I confirm that:**
- All UAT activities have been completed
- The system meets business requirements
- Critical issues have been resolved
- The system is ready for production

**Signatures:**

**Farmer Representative:** _________________ Date: _______

**DTAM Representative:** _________________ Date: _______

**Project Manager:** _________________ Date: _______

**QA Lead:** _________________ Date: _______

---

## 🚀 Post-UAT Actions

1. **Analyze feedback**
   - Categorize issues
   - Prioritize fixes
   - Plan improvements

2. **Fix critical issues**
   - Address all critical bugs
   - Retest fixes
   - Get user confirmation

3. **Document lessons learned**
   - What went well
   - What needs improvement
   - Recommendations for future

4. **Prepare for production**
   - Final deployment checklist
   - User training plan
   - Support plan

---

**Document Version:** 1.0.0  
**Created:** 2025-01-15  
**Status:** ✅ Ready for UAT
