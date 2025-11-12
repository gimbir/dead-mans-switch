# Phase 1 Implementation Roadmap - Dead Man's Switch

**Document Version:** 1.0 **Created:** November 2025 **Timeline:** 8 Weeks **Status:** Active
Development

---

## 📊 Executive Summary

This roadmap outlines the critical features needed to complete Phase 1 of the Dead Man's Switch
project. Based on the comprehensive analysis of existing code and market requirements, we've
identified 8 critical features that must be implemented to achieve production readiness.

### Current Project Status

- **Overall Completion (Phase 1):** 60-65%
- **Backend Completion:** 85-90%
- **Frontend Completion:** 55-60%
- **Architecture Quality:** Excellent (Clean Architecture, DDD)
- **Latest Milestone:** ✅ 2FA Complete (November 2025)

---

## 🎯 Critical Missing Features (Priority Order)

### 1. Two-Factor Authentication (2FA) - PRIORITY 1 ✅

**Status:** 100% Complete **Effort:** 2-3 weeks (Completed) **Impact:** CRITICAL - Security standard
for 2025

**Requirements:**

- ✅ TOTP support (Google Authenticator, Authy, 1Password)
- ✅ QR code generation for setup
- ✅ Backup codes (10x one-time recovery codes)
- ✅ SHA1 algorithm for maximum compatibility
- ✅ Encrypted secret storage
- ✅ 2FA login verification flow
- ✅ Enable/Disable/Verify endpoints
- ❌ SMS fallback (optional - future)
- ❌ Remember device option (30 days - future)
- ❌ Forced 2FA for admin actions (future)

### 2. Multi-Channel Notifications

**Status:** 15% Complete (Email only) **Effort:** 2-3 weeks

**Channels to Add:**

- ✅ Email (existing)
- ❌ SMS (Twilio)
- ❌ Telegram Bot
- ❌ WhatsApp Business API
- ❌ Webhooks

### 3. Test/Simulation Mode

**Status:** 0% Complete **Effort:** 1 week

**Features:**

- Simulate switch trigger without activation
- Test message delivery
- Verify notification channels
- Dry-run mode

### 4. Backup Codes & Account Recovery

**Status:** 0% Complete **Effort:** 3-5 days **Dependency:** Requires 2FA implementation

### 5. Pause/Resume Switch Functionality

**Status:** Partial (DB ready, API/UI missing) **Effort:** 3-4 days

### 6. User Settings Page

**Status:** 50% Complete (2FA section done) **Effort:** 1 week

**Completed:**

- ✅ Settings page layout with tabs
- ✅ Security tab with 2FA settings
- ✅ Multi-language support
- ✅ Route guards (PublicOnlyRoute)

**Remaining:**

- ❌ Profile settings section
- ❌ Notification preferences section
- ❌ Language/timezone preferences
- ❌ Account deletion functionality

### 7. Enhanced Encryption

**Status:** Partial (client-side only) **Effort:** 3-4 weeks

### 8. Audit Logs

**Status:** Basic logging only **Effort:** 1 week

---

## 📅 8-Week Implementation Schedule

### Week 1-2: 2FA Backend Implementation ✅ COMPLETED

**Sprint Goal:** Complete backend infrastructure for 2FA

**Tasks:**

- [x] Create database migrations for 2FA fields
  ```sql
  - twoFactorSecret: string (encrypted)
  - twoFactorEnabled: boolean
  - backupCodes: string[] (hashed)
  - lastBackupCodeUsedAt: DateTime
  ```
- [x] Install required packages (otpauth, qrcode, bcryptjs)
- [x] Implement TOTP generation and verification
- [x] Create backup code generation system
- [x] Add 2FA middleware for protected routes
- [x] Create 2FA enable/disable endpoints
- [x] Implement backup code validation
- [x] Fix JWT token generation with issuer/audience
- [x] Add User.enable2FA() atomic method for optimistic locking

**Deliverables:**

- ✅ Working 2FA backend API
- ✅ Database schema updated
- ✅ Encryption for 2FA secrets
- ✅ SHA1 algorithm for compatibility

### Week 3: 2FA Frontend Implementation ✅ COMPLETED

**Sprint Goal:** Complete 2FA user interface

**Tasks:**

- [x] Create 2FA setup wizard component (TwoFactorSettings)
- [x] Implement QR code display component
- [x] Build TOTP input component with auto-focus
- [x] Create backup codes display/download component
- [x] Add 2FA status to Settings page
- [x] Implement 2FA challenge on login (Verify2FAPage)
- [x] Create 2FA disable confirmation flow
- [x] Add route guards (PublicOnlyRoute)
- [x] Add i18n translations (EN/TR)

**Deliverables:**

- ✅ Complete 2FA setup flow
- ✅ 2FA login challenge
- ✅ Backup codes management UI
- ✅ Settings page with Security tab

### Week 4-5: Multi-Channel Notifications

**Sprint Goal:** Add SMS and Telegram notifications

**Week 4 - SMS Integration:**

- [ ] Set up Twilio account and credentials
- [ ] Create SMS notification service
- [ ] Add phone number to user model
- [ ] Implement phone verification
- [ ] Create SMS templates
- [ ] Add SMS preference settings

**Week 5 - Telegram Integration:**

- [ ] Create Telegram bot
- [ ] Implement bot commands
  - /start - Register
  - /checkin - Perform check-in
  - /status - View switches
  - /pause - Pause switch
- [ ] Add Telegram linking to user profile
- [ ] Create Telegram notification service
- [ ] Test bot interactions

**Deliverables:**

- Working SMS notifications
- Telegram bot live
- Notification preferences UI

### Week 6: Test Mode & Simulation

**Sprint Goal:** Implement comprehensive testing capabilities

**Tasks:**

- [ ] Create simulation API endpoints
- [ ] Add test mode flag to switches
- [ ] Implement dry-run message sending
- [ ] Create simulation dashboard
- [ ] Add time progression simulation
- [ ] Build notification delivery testing
- [ ] Create test report generation

**Deliverables:**

- Test mode toggle
- Simulation results page
- Test notification system

### Week 7: Pause/Resume & Settings Page

**Sprint Goal:** Complete switch management and user settings

**Pause/Resume Tasks:**

- [ ] Create pause/resume API endpoints
- [ ] Add pause status to switch model
- [ ] Implement pause duration options
- [ ] Create pause/resume UI components
- [ ] Add pause history tracking
- [ ] Create pause notification system

**Settings Page Tasks:**

- [ ] Design settings page layout
- [ ] Create notification preferences section
- [ ] Build security settings section
- [ ] Add account management section
- [ ] Implement timezone settings
- [ ] Create data export functionality

**Deliverables:**

- Working pause/resume feature
- Complete settings page
- User preferences management

### Week 8: Testing, Security Audit & Documentation

**Sprint Goal:** Production readiness

**Tasks:**

- [ ] Comprehensive integration testing
- [ ] Security audit (OWASP Top 10)
- [ ] Performance testing
- [ ] Load testing
- [ ] Create user documentation
- [ ] Update API documentation
- [ ] Prepare deployment guide
- [ ] Create backup and recovery procedures

**Deliverables:**

- Test coverage >80%
- Security audit report
- Complete documentation
- Production deployment ready

---

## 🚀 Quick Start Actions

### Immediate Actions (Day 1)

1. **Database Migration for 2FA**

   ```bash
   npx prisma migrate dev --name add_2fa_fields
   ```

2. **Install 2FA Dependencies**

   ```bash
   cd backend
   npm install speakeasy qrcode jsonwebtoken
   ```

3. **Set up Twilio Account**

   - Create account at https://www.twilio.com
   - Get API credentials
   - Purchase phone number
   - Add to .env file

4. **Create Feature Branches**
   ```bash
   git checkout -b feature/2fa-implementation
   ```

### Environment Variables to Add

```env
# 2FA
TWO_FACTOR_APP_NAME=DeadMansSwitch
TWO_FACTOR_ISSUER=deadmansswitch.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://api.yourdomain.com/telegram/webhook
```

---

## 📊 Success Metrics

### Technical Metrics

- [ ] 2FA adoption rate: >60% of users
- [ ] SMS delivery success rate: >98%
- [ ] Telegram bot response time: <500ms
- [ ] Test coverage: >80%
- [ ] Zero security vulnerabilities (OWASP scan)

### User Experience Metrics

- [ ] 2FA setup completion rate: >90%
- [ ] Settings page usage: >70% of users
- [ ] Notification delivery rate: >99%
- [ ] User satisfaction score: >4.5/5

### Performance Metrics

- [ ] API response time: <100ms (p95)
- [ ] Frontend load time: <2s
- [ ] Database query time: <50ms (p95)
- [ ] Background job processing: <5s

---

## 🔄 Risk Management

### Identified Risks

1. **2FA Implementation Complexity**

   - Mitigation: Use well-tested libraries (speakeasy)
   - Fallback: Start with basic TOTP, add SMS later

2. **SMS Cost Overruns**

   - Mitigation: Rate limiting, usage caps
   - Fallback: Email-only for free tier

3. **Telegram Bot Approval**

   - Mitigation: Apply early, follow guidelines
   - Fallback: Webhook integration first

4. **User Adoption Resistance**
   - Mitigation: Optional 2FA initially, incentivize with features
   - Fallback: Gradual rollout

---

## 📋 Dependencies

### External Services

- **Twilio** - SMS notifications
- **Telegram** - Bot API
- **Google Authenticator** - TOTP
- **SendGrid/AWS SES** - Email (existing)

### NPM Packages

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.0",
  "twilio": "^4.0.0",
  "node-telegram-bot-api": "^0.61.0",
  "bcrypt": "^5.1.0"
}
```

---

## 🎯 Definition of Done

Each feature is considered complete when:

1. ✅ All acceptance criteria met
2. ✅ Unit tests written and passing (>80% coverage)
3. ✅ Integration tests passing
4. ✅ Code reviewed and approved
5. ✅ Documentation updated
6. ✅ Deployed to staging environment
7. ✅ Security review passed
8. ✅ Performance benchmarks met

---

## 📝 Notes

- Priority 1 features (2FA) block other features and must be completed first
- Each week includes time for testing and bug fixes
- Documentation should be updated continuously, not just in Week 8
- Consider feature flags for gradual rollout
- Maintain backwards compatibility during migration

---

## 🔗 Related Documents

- [FEATURE_ANALYSIS.md](./FEATURE_ANALYSIS.md) - Complete feature analysis
- [PROJECT_STATE_ANALYSIS.md](./PROJECT_STATE_ANALYSIS.md) - Current state analysis
- [EXPLORATION_SUMMARY.md](./EXPLORATION_SUMMARY.md) - Quick exploration summary
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Original project plan

---

## 🎉 Recent Achievements

### November 2025 - 2FA Implementation Complete

**Duration:** 3 weeks **Impact:** Major security milestone achieved

**What was delivered:**

- ✅ Complete TOTP-based 2FA system using SHA1 algorithm
- ✅ QR code generation for authenticator apps (Google Authenticator, Authy, etc.)
- ✅ 10 backup codes with bcrypt hashing
- ✅ Encrypted 2FA secret storage using AES encryption
- ✅ JWT token generation with issuer/audience claims
- ✅ Settings page with Security tab
- ✅ Route guards for authenticated/public-only pages
- ✅ Full i18n support (English and Turkish)
- ✅ Atomic User.enable2FA() method to prevent optimistic locking issues

**Technical highlights:**

- Fixed JWT verification by using JwtUtil for consistent token generation
- Resolved algorithm mismatch (SHA256 → SHA1) for maximum compatibility
- Implemented PublicOnlyRoute to prevent authenticated users from accessing auth pages
- Added replace: true to navigation for better UX

**Next Priority:** Multi-Channel Notifications (SMS and Telegram)

---

**Document Owner:** Development Team **Last Updated:** November 12, 2025 **Next Review:** Week 4
(Mid-point review)
