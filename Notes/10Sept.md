# verify email



REGISTER
   ↓
Create user
isVerified = false
   ↓
Generate 6-digit OTP
   ↓
Store OTP temporarily
   ↓
Amazon SES sends OTP email
   ↓
Frontend shows:
"Enter OTP"
   ↓
User enters 6 digits
   ↓
POST /auth/verify-email
   ↓
Compare OTP
   ↓
Check expiry
   ↓
isVerified = true
   ↓
Delete OTP

And importantly, your booking confirmation and cancellation emails will eventually use the same Amazon SES email service.

# First we'll set up the AWS side correctly.

Our immediate sequence
STEP 1
Amazon SES
   ↓
Verify your sender email
   ↓
Test sending email

STEP 2
Create EmailVerification model

STEP 3
Create OTP service

STEP 4
Change registration verification
Link/token ❌
OTP ✅

STEP 5
Change event publishing verification
Link/token ❌
OTP ✅

STEP 6
Change VerifyEmailPage
Link-click page ❌
OTP entry page ✅

STEP 7
Change email.ts
Resend ❌
SES ✅

STEP 8
Test:
Registration → OTP → verified

STEP 9
Test:
Create/publish event → OTP → verified

STEP 10
Test:
Booking confirmation → SES

STEP 11
Test:
Cancellation → SES

STEP 12
Commit/push email changes

STEP 13
Return to Razorpay branch

===========
Organizer
   ↓
Publish Event
   ↓
event.service.ts
   ↓
Is user verified?
   │
   ├── YES
   │     ↓
   │   PUBLISH EVENT
   │
   └── NO
         ↓
   sendVerificationOtp()
         ↓
   Generate 6-digit OTP
         ↓
   EmailVerification collection
         ↓
   Amazon SES
         ↓
   User receives OTP
         ↓
   403 response

   =====
   User clicks Publish
       ↓
isVerified === false
       ↓
sendVerificationOtp()
       ↓
Generate 6-digit OTP
       ↓
Save OTP in EmailVerification collection
       ↓
Amazon SES sends OTP email
       ↓
Frontend opens /verify-email
       ↓
User enters 6-digit OTP
       ↓
POST /auth/verify-email-otp
       ↓
verifyEmailOtp()
       ↓
user.isVerified = true
       ↓
OTP deleted


====

CREATE EVENT
    ↓
Click Publish
    ↓
publishEvent(eventId)
    ↓
Backend checks isVerified
    ↓
 ┌──────────────────────┐
 │ Verified?             │
 └──────────────────────┘
       ↓ YES                    ↓ NO
   PUBLISH              Generate OTP
       ↓                       ↓
   Success             SES sends email
                               ↓
                       HTTP 403 response
                               ↓
                  /verify-email?eventId=...
                               ↓
                         Enter OTP
                               ↓
                  POST /auth/verify-email-otp
                               ↓
                       isVerified = true
                               ↓
                    /events/:id/edit
                               ↓
                         Click Publish
                               ↓
                       Event PUBLISHED ✅

                       ==