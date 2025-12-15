# WhatsApp Error Troubleshooting Guide
## "Message undeliverable as Meta has restricted it for higher quality messaging"

This error occurs when Meta blocks your WhatsApp marketing message. Here's how to diagnose and fix it.

---

## 🔍 Step 1: Identify the Root Cause

### Check in WATI Dashboard:

1. **Go to WATI → Broadcasts → Your Campaign**
2. **Check the error code**:
   - `131049` = Frequency Capping
   - `131026` = Recipient Issues
   - Other = Template Quality/Account Issues

3. **Check Template Status**:
   - Go to **Message Templates** in WATI
   - Find "bengaluru" template
   - Check status: Should be "APPROVED" with GREEN status

4. **Check Quality Rating**:
   - Go to **Settings → Channel Status**
   - Look for "Quality Rating"
   - Should be: **GREEN (High)** or **YELLOW (Medium)**
   - ❌ If RED (Low): Your account is flagged

---

## 🛠️ Solutions by Cause

### Cause 1: Frequency Capping (Error 131049)
**What it means**: User already received 2 marketing messages in 24 hours

**✅ Solution**:
- ✅ **WATI automatically retries** (you enabled this in Audience Overview)
- Wait 24-48 hours for automatic retry
- No action needed - WATI handles it!

**Manual retry**:
- Wait at least 24 hours before manual retry
- Use increasing intervals: 2 days → 1 week

---

### Cause 2: Recipient Issues (Error 131026)
**What it means**: Problem with recipient's WhatsApp

**✅ Solution**:
1. Verify phone number is correct: `91XXXXXXXXXX` format
2. Ask user to:
   - Update WhatsApp to latest version
   - Accept WhatsApp's Terms of Service
   - Ensure WhatsApp is active on that number

**Prevention**:
- Add phone validation in your form
- Send SMS asking user to verify WhatsApp is active

---

### Cause 3: Template Quality Issues
**What it means**: Your template has low engagement or quality rating

**✅ Immediate Fixes**:

1. **Check Template Content**:
   ```
   ❌ BAD: Generic, salesy, spammy
   ✅ GOOD: Personalized, valuable, expected
   ```

2. **Your "bengaluru" Template Checklist**:
   - [ ] Uses `{{name}}` parameter correctly
   - [ ] Uses `{{image}}` parameter correctly
   - [ ] No typos or grammar errors
   - [ ] No excessive emojis or caps
   - [ ] Clear value proposition
   - [ ] No misleading content

3. **Improve Template**:
   - Make message more personal
   - Ensure image loads properly
   - Add clear call-to-action
   - Remove any spam-like language

4. **Template Character Limits**:
   - Header: 60 characters max
   - Body: 1024 characters max
   - Footer: 60 characters max
   - Your template is within limits ✅

**✅ Long-term Fixes**:

1. **Monitor Engagement**:
   - Go to **WATI → Analytics**
   - Check "Read Rate" for your template
   - Should be > 60% for good quality

2. **Improve Quality Rating**:
   - Send messages only to engaged users
   - Avoid sending to users who haven't opted in
   - Reduce message frequency
   - Monitor block/report rates

---

### Cause 4: Meta's 1% Experiment
**What it means**: User is in Meta's 1% test group (can't receive marketing unless they message first)

**✅ Solution**:
1. Contact user via EMAIL first
2. Ask them to send "Hi" to your WhatsApp number
3. Once they message, you have 24-hour window to send template

**Automation Idea**:
```typescript
// In your email, include:
"To receive updates on WhatsApp, please message us at:
https://wa.me/919XXXXXXXXX?text=Hi"
```

---

## 🔧 Implementation Fixes for Your Code

### Fix 1: Add Retry Delay Based on Error Code

Update `lib/wati.ts`:

```typescript
export async function sendRegistrationWhatsApp(
  name: string,
  mobile: string,
  ticketImageUrl: string,
  retryCount: number = 0,
  maxRetries: number = 2  // Reduce to 2 since WATI will retry automatically
): Promise<WatiResponse> {
  const parameters: WatiTemplateParameter[] = [
    { name: "name", value: name },
    { name: "image", value: ticketImageUrl }
  ]

  const result = await sendWatiTemplateMessage({
    whatsappNumber: mobile,
    templateName: "bengaluru",
    parameters,
    broadcastName: "Toyota Bengaluru Registration"
  })

  // Don't retry on frequency cap errors - let WATI handle it
  if (!result.success && retryCount < maxRetries) {
    // Check if error is frequency cap (131049) - don't retry immediately
    if (result.error?.includes('frequency') || result.error?.includes('restricted')) {
      console.log('⚠️ Frequency cap or Meta restriction detected. Letting WATI auto-retry.')
      return result // Return failure, WATI will retry automatically
    }

    // For other errors, retry with backoff
    const delay = Math.min(2000 * Math.pow(2, retryCount), 10000)
    console.log(`WhatsApp send failed (attempt ${retryCount + 1}/${maxRetries}). Retrying in ${delay}ms...`)

    await new Promise(resolve => setTimeout(resolve, delay))
    return sendRegistrationWhatsApp(name, mobile, ticketImageUrl, retryCount + 1, maxRetries)
  }

  return result
}
```

### Fix 2: Add Phone Number Validation

Update `components/registration-page.tsx`:

```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  // ... existing validations ...

  // Enhanced mobile validation
  if (!formData.mobile.trim()) {
    newErrors.mobile = "Mobile number is required"
  } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
    newErrors.mobile = "Enter valid 10-digit mobile number starting with 6-9"
  }

  // ... rest of validations ...
}
```

### Fix 3: Log Error Details for Debugging

Update `app/api/generate-ticket/route.ts`:

```typescript
// Log WhatsApp result with more details
if (whatsappResult.success) {
  console.log("✅ WhatsApp message sent successfully to:", mobile)
  // Update database...
} else {
  console.error("❌ WhatsApp send failed:", {
    mobile,
    error: whatsappResult.error,
    timestamp: new Date().toISOString()
  })

  // Store error for later analysis
  await supabaseAdmin
    .from("toyota_microsite_users")
    .update({
      whatsapp_error: whatsapp Result.error,
      whatsapp_last_attempt: new Date().toISOString()
    })
    .eq("uid", uid)
}
```

---

## 📊 Monitoring & Prevention

### 1. Check WATI Quality Dashboard Daily
- Login to WATI
- Go to **Settings → Channel Status**
- Monitor quality rating (should stay GREEN)

### 2. Monitor Template Performance
- Go to **Message Templates → bengaluru**
- Check metrics:
  - Delivery Rate: Should be > 90%
  - Read Rate: Should be > 60%
  - Response Rate: Track engagement

### 3. Set Up Alerts
- If quality rating drops to YELLOW/RED
- If delivery rate < 85%
- If getting multiple 131049 errors

### 4. Best Practices
✅ Only send to users who completed registration
✅ Ensure images load fast (your Supabase URLs are good)
✅ Personalize with user's actual name
✅ Send immediately after registration (within 5 minutes)
✅ Don't send duplicate messages to same number

---

## 🎯 Recommended Actions for Your Template

### Current Template Analysis:
```
Template: bengaluru
Status: APPROVED ✅
Parameters: {{name}}, {{image}}
Category: Marketing
```

### Improvements to Consider:

1. **Make it more conversational**:
   ```
   Current: "Congratulations on winning your buddy pass."
   Better: "Great news {{name}}! You've won a buddy pass! 🎉"
   ```

2. **Add urgency/value**:
   ```
   Current: "We will be sharing an RSVP mail on 19th December"
   Better: "Save your spot! RSVP details coming on Dec 19th. Limited seats available."
   ```

3. **Ensure image quality**:
   - Test that ticket images load quickly
   - Verify QR codes are scannable
   - Check image dimensions (your current: ~700x800 ✅)

---

## 📞 When to Contact WATI Support

Contact WATI if:
- ❌ Quality rating is RED and won't improve
- ❌ Template gets REJECTED after approval
- ❌ Consistent failures (> 20%) with no clear reason
- ❌ Account gets restricted or suspended

**WATI Support**: Available in your dashboard under "Help"

---

## ✅ Quick Checklist

Before sending messages:
- [ ] Template status is APPROVED
- [ ] Quality rating is GREEN or YELLOW
- [ ] Phone numbers are valid Indian mobile (10 digits)
- [ ] Image URLs are accessible and load fast
- [ ] User opted in by completing registration
- [ ] Not sending duplicate to same number
- [ ] WATI auto-retry is enabled (already done ✅)

---

## 🔗 Sources & References

- [How to troubleshoot common Broadcast errors - WATI](https://support.wati.io/en/articles/11463447-how-to-troubleshoot-common-broadcast-errors)
- [Ways To Resolve WhatsApp Error 131026](https://www.interakt.shop/blog/131026-message-undeliverable-error-in-whatsapp/)
- [Meta's Frequency Capping for WhatsApp Business](https://crmsupport.freshworks.com/support/solutions/articles/50000009847)
- [Troubleshooting Message Undeliverable Error](https://www.heltar.com/blogs/troubleshooting-131026-message-undeliverable-error-in-whatsapp-business-api-cm264zbb5008bqegvrftuynrm)

---

**Last Updated**: December 2025
