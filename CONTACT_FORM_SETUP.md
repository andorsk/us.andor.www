# Contact Form Setup

The contact form is now configured to send emails directly to contact@andor.us using Resend.

## Quick Setup (5 minutes)

### 1. Create a Resend Account
- Go to https://resend.com/signup
- Sign up (it's free for up to 100 emails/day)

### 2. Get Your API Key
- Go to https://resend.com/api-keys
- Click "Create API Key"
- Give it a name (e.g., "Andor.us Contact Form")
- Copy the API key (it starts with `re_`)

### 3. Add API Key to Environment
Open `.env.local` and replace the placeholder:
```
RESEND_API_KEY=re_your_actual_api_key_here
```

### 4. Restart the Dev Server
```bash
pnpm run dev
```

## That's it!

The contact form will now send emails directly to contact@andor.us whenever someone submits the form.

## For Production

To use a custom "from" email address (instead of onboarding@resend.dev):

1. Verify your domain in Resend:
   - Go to https://resend.com/domains
   - Add your domain (e.g., andor.us)
   - Add the DNS records they provide

2. Update the API route:
   - Edit `src/app/api/contact/route.ts`
   - Change `from: "Contact Form <onboarding@resend.dev>"`
   - To: `from: "Contact Form <noreply@andor.us>"`

## Testing

You can test the form by:
1. Going to http://localhost:3002
2. Asking the chat "How do I contact you?"
3. Filling out the form that appears
4. You should receive an email at contact@andor.us

## Free Tier Limits

Resend's free tier includes:
- 3,000 emails/month
- 100 emails/day
- Perfect for a contact form!
