# Security & Privacy Policy

## Data Collection & Usage

### What Data We Collect

1. **User Messages**
   - Messages sent to the API are processed by LLM
   - Messages are stored in `route_log.jsonl` locally
   - Messages are NOT sent to external storage by default

2. **System Metrics**
   - Request count and timing
   - Intent distribution statistics
   - Uptime and performance data

3. **API Keys**
   - Groq API key stored in `.env` file
   - Only used for API authentication
   - Never logged or exposed

### What We DON'T Do

- ❌ Sell or share user data
- ❌ Use messages for training (except with explicit consent)
- ❌ Store data in cloud without explicit configuration
- ❌ Share API keys with third parties
- ❌ Log sensitive information

---

## Data Privacy

### Local Storage

Messages are stored in `route_log.jsonl` on your server:

```json
{
  "timestamp": "2026-03-12T14:30:45.123Z",
  "intent": "code",
  "confidence": 0.95,
  "user_message": "How do I sort arrays?",
  "final_response": "..."
}
```

### Access Control

- Only accessible via `/api/logs` endpoint
- Control access via network security
- Implement authentication if needed

### Data Retention

By default:

- No automatic deletion
- Manual cleanup via file management
- Check DEPLOYMENT.md for retention policies

---

## Security Best Practices

### 1. Environment Variables

**DO:**

```bash
# .env file (not in Git)
GROQ_API_KEY=sk-xxx...
```

**DON'T:**

```bash
# Don't log or commit keys
console.log(process.env.GROQ_API_KEY)
git add .env
```

### 2. API Key Management

```bash
# Rotate keys regularly
# Use environment-specific keys if possible
# Monitor API key usage in Groq dashboard
```

### 3. HTTPS/TLS

Always use HTTPS in production:

```bash
# Production deployment should have:
# - SSL certificate
# - HTTPS enabled
# - HTTP → HTTPS redirect
```

### 4. Input Validation

The system validates:

- Message length (max 10,000 chars)
- Message format (must be string)
- Empty message rejection
- No code injection possible (no SQL DB)

### 5. Rate Limiting

Implement rate limiting:

```typescript
// Consider adding:
// - Per-IP rate limiting
// - Per-API-key rate limiting
// - Time-based quotas
```

---

## Authentication & Authorization

### Current Implementation

- No authentication required (public API)
- Based on network security

### Securing Your Deployment

```bash
# Option 1: Network Security
# - Firewall rules
# - VPN access only
# - IP whitelisting

# Option 2: API Key Authentication
# - Add header validation
# - Implement auth middleware

# Option 3: OAuth
# - Implement OAuth provider
# - Use third-party auth service
```

Example with API key:

```typescript
// In middleware.ts - add this
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
```

---

## Data Encryption

### In Transit

- Use HTTPS/TLS (1.2+)
- Encrypt API calls to Groq
- Encrypt logs in transit

### At Rest

- Store API keys in environment variables only
- Encrypt sensitive logs if required
- Use encrypted storage for backups

```bash
# Encrypt logs example:
gpg --symmetric route_log.jsonl
# Decrypt:
gpg --decrypt route_log.jsonl.gpg
```

---

## Compliance

### GDPR Considerations

If your users are in EU:

- Implement data deletion on request
- Provide data export functionality
- Update privacy policy

Example implementation:

```bash
# Add endpoint to delete logs
DELETE /api/logs/:id

# Add endpoint to export logs
GET /api/logs/export
```

### CCPA (California)

If users in California:

- Disclose data collection
- Provide opt-out mechanisms
- Implement data portability

### Data Retention

```bash
# Implement retention policy
# Delete logs older than X days

DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

# Or use file-based cleanup
find . -name "route_log.jsonl.*" -mtime +90 -delete
```

---

## Third-Party Dependencies

### Groq API

- [Privacy Policy](https://www.groq.com/privacy)
- [Terms of Service](https://www.groq.com/terms)
- Data handling: Messages sent to Groq for processing
- Recommendation: Review their policies

### Dependencies Security

```bash
# Check for vulnerabilities
npm audit

# Update dependencies securely
npm audit fix

# Review packages
npm ls
```

---

## Incident Response

### Security Incident

If you discover a security issue:

1. **DO NOT** commit the issue to Git
2. **DO NOT** expose the issue publicly
3. Contact maintainers privately
4. Provide detailed reproduction steps

### Data Breach

If logs are compromised:

```bash
# 1. Stop the server
# 2. Secure the environment
# 3. Rotate API keys:
#    - Generate new Groq key
#    - Update .env
#    - Restart server
# 4. Review logs for unauthorized access
# 5. Notify relevant parties
```

---

## User Privacy Guidelines

### For Users

- Messages are sent to Groq API
- Messages may be logged locally
- Do not send sensitive personal data
- Review Groq's privacy policy

### For Operators

- Inform users about logging
- Provide log access/deletion options
- Implement appropriate security
- Monitor for unauthorized access

---

## Security Checklist

Production Deployment:

- [ ] API keys in environment variables only
- [ ] HTTPS enabled
- [ ] Input validation active
- [ ] Error messages don't leak sensitive info
- [ ] Logs protected from unauthorized access
- [ ] Regular backups taken
- [ ] Dependency vulnerabilities checked
- [ ] Rate limiting implemented
- [ ] Authentication configured
- [ ] CORS properly configured
- [ ] Firewall rules in place
- [ ] Monitoring enabled
- [ ] Incident plan established

---

## Security Updates

- [ ] Subscribe to Node.js security updates
- [ ] Monitor dependency vulnerabilities: `npm audit`
- [ ] Review Groq API security notices
- [ ] Keep Express.js updated
- [ ] Monitor GitHub security advisories

---

## Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **Email**: [security contact if available]
3. **Include**:
   - Vulnerability description
   - Reproduction steps
   - Potential impact
   - Proposed fix (if any)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [npm Security](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

## Policy Updates

This policy may be updated. Check the [CHANGELOG.md](./CHANGELOG.md) for updates.

**Last Updated:** 2026-03-12
