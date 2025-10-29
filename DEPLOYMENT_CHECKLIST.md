# GACP Platform - Deployment Checklist

## Week 1: Security Foundation ✅ IN PROGRESS

### Day 1-2: Secret Generation & Audit

- [x] Generate secure secrets (`node scripts/security/generate-secrets.js`)
- [x] Run security audit (`node scripts/security/secrets-audit.js`)
- [x] Review security implementation guide
- [ ] Document all findings in security report
- [ ] Prioritize critical vs non-critical fixes

### Day 3-4: AWS Secrets Manager Setup

- [ ] Install AWS CLI and configure credentials
- [ ] Install Terraform
- [ ] Edit `infrastructure/aws/terraform.tfvars` with generated secrets
- [ ] Run `terraform init` in `infrastructure/aws/`
- [ ] Run `terraform plan` and review changes
- [ ] Run `terraform apply` to deploy secrets
- [ ] Verify secrets in AWS Console
- [ ] Test secrets retrieval from backend

### Day 5: Production Code Fixes

- [ ] Run automated fix: `node scripts/security/fix-secrets.js apps/backend`
- [ ] Review git diff for all changes
- [ ] Manually fix critical files:
  - [ ] `apps/backend/shared/auth.js`
  - [ ] `apps/backend/config/config-manager.js`
  - [ ] `apps/backend/routes/auth.js`
- [ ] Update test files to use fixtures
- [ ] Commit changes: `git commit -m "security: remove hardcoded secrets"`

### Day 6-7: Testing & Validation

- [ ] Test backend startup with AWS secrets
- [ ] Verify all environment variables loaded
- [ ] Test authentication flows (farmer + DTAM)
- [ ] Test database connections
- [ ] Run full test suite
- [ ] Document any issues found

## Week 2: Infrastructure Setup 📋 SCHEDULED

### Terraform Infrastructure

- [ ] Create VPC configuration (`infrastructure/aws/vpc.tf`)
- [ ] Create ECS cluster configuration (`infrastructure/aws/ecs.tf`)
- [ ] Create RDS/DocumentDB config (if needed)
- [ ] Create ElastiCache Redis config
- [ ] Create S3 buckets for documents
- [ ] Create CloudWatch log groups
- [ ] Create IAM roles and policies
- [ ] Deploy infrastructure: `terraform apply`

### Docker & Container Registry

- [ ] Create Dockerfiles for all apps
- [ ] Build and test Docker images locally
- [ ] Create ECR repositories
- [ ] Push images to ECR
- [ ] Create ECS task definitions
- [ ] Create ECS services
- [ ] Configure load balancers

### CI/CD Pipeline

- [ ] Create GitHub Actions workflows
- [ ] Configure automated testing
- [ ] Configure automated builds
- [ ] Configure automated deployments
- [ ] Test full CI/CD pipeline

## Week 3-4: Portal Completion 📋 SCHEDULED

### Admin Portal (20-30 hours)

- [ ] User management interface
  - [ ] List users (farmers + DTAM)
  - [ ] Create/edit user forms
  - [ ] Role assignment UI
  - [ ] Password reset functionality
- [ ] System configuration
  - [ ] Application settings page
  - [ ] Payment gateway config
  - [ ] Notification settings
  - [ ] Email/SMS templates editor
- [ ] Analytics dashboards
  - [ ] Cannabis-first metrics
  - [ ] Regional breakdowns
  - [ ] Approval rate trends
  - [ ] Inspector performance
- [ ] Report generation
  - [ ] Custom report builder
  - [ ] Export to CSV/Excel/PDF
  - [ ] Scheduled reports

### Certificate Portal (10-15 hours)

- [ ] Certificate management
  - [ ] List all certificates (role-based)
  - [ ] Certificate details view
  - [ ] Bulk operations (revoke, export)
- [ ] Advanced search
  - [ ] By certificate number
  - [ ] By farm name
  - [ ] By date range
  - [ ] By status
- [ ] Export features
  - [ ] PDF download
  - [ ] CSV export
  - [ ] QR code batch generation

## Week 5: Testing & QA 📋 PLANNED

### Automated Testing

- [ ] Complete E2E test coverage
- [ ] Integration tests for all APIs
- [ ] Performance testing with Artillery
- [ ] Load testing (1000+ concurrent users)
- [ ] Stress testing

### Security Testing

- [ ] OWASP Top 10 compliance check
- [ ] Penetration testing
- [ ] Dependency audit
- [ ] Code security scanning
- [ ] Secret scanning verification

### User Acceptance Testing

- [ ] Farmer portal UAT
- [ ] Admin portal UAT
- [ ] Certificate portal UAT
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing

## Week 6: Staging Deployment 📋 PLANNED

### Staging Environment

- [ ] Deploy to staging environment
- [ ] Configure staging database
- [ ] Configure staging secrets
- [ ] Test all workflows end-to-end
- [ ] Performance benchmarking
- [ ] Fix any issues found

### Documentation

- [ ] Update API documentation
- [ ] Create deployment runbooks
- [ ] Write user guides
- [ ] Document operational procedures
- [ ] Create troubleshooting guide

## Week 7-8: Production Launch 📋 PLANNED

### Pre-Launch

- [ ] Final security review
- [ ] Final performance review
- [ ] Backup and recovery testing
- [ ] Monitoring and alerting setup
- [ ] Incident response plan
- [ ] Communication plan

### Launch Day

- [ ] Deploy to production
- [ ] Smoke testing
- [ ] Monitor for issues
- [ ] Be ready for rollback
- [ ] Communicate with stakeholders

### Post-Launch

- [ ] Monitor system health (24-48 hours)
- [ ] Gather user feedback
- [ ] Fix critical issues immediately
- [ ] Plan for improvements
- [ ] Celebrate success! 🎉

## Critical Metrics to Track

### Security

- Zero hardcoded secrets in production code
- All secrets in AWS Secrets Manager
- OWASP Top 10 compliance: 10/10
- No critical vulnerabilities

### Performance

- API response time < 200ms (p95)
- Page load time < 2s
- Support 1000+ concurrent users
- 99.9% uptime

### Quality

- Test coverage > 80%
- Zero critical bugs
- All E2E tests passing
- All portals 100% functional

## Risk Mitigation

### High Risk Items

1. **Hardcoded secrets exposure** → Fixed in Week 1
2. **AWS deployment issues** → Mitigated with staging testing
3. **Performance bottlenecks** → Addressed with load testing
4. **Data loss** → Prevented with automated backups

### Rollback Plan

- Keep previous version deployable
- Database migration rollback scripts
- Quick rollback procedure documented
- Communication plan for downtime

## Success Criteria

### Must Have (Launch Blockers)

- ✅ Security: All secrets in AWS Secrets Manager
- ⏳ Functionality: All 3 portals 100% complete
- ⏳ Infrastructure: AWS deployment successful
- ⏳ Testing: All critical paths tested
- ⏳ Documentation: Deployment runbooks complete

### Should Have (Post-Launch)

- Mobile inspector app
- Government API integration
- Advanced analytics
- Blockchain verification

### Nice to Have (Future)

- Marketplace features
- Cooperative management
- Remote sensing integration
- International standards

## Notes & Decisions

### Week 1 Notes

- Security audit completed: 300+ findings
- AWS Secrets Manager integration implemented
- Git hooks configured for code quality

### Decisions Made

- Use AWS Secrets Manager (not HashiCorp Vault)
- Deploy to ECS (not EKS for simplicity)
- MongoDB Atlas (not self-hosted)
- Redis ElastiCache (not self-hosted)

### Open Questions

- [ ] Confirm AWS account and budget
- [ ] Confirm MongoDB Atlas tier
- [ ] Confirm Redis instance size
- [ ] Confirm domain name and SSL certificates

---

**Last Updated:** 2025-01-XX  
**Status:** Week 1 in progress  
**Next Review:** End of Week 1
