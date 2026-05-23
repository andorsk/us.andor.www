# Vercel Deployment Guide

## Environment Variables to Add in Vercel

You need to add these environment variables in your Vercel project settings:

### 1. Go to Vercel Project Settings
- Go to https://vercel.com
- Select your project (us.andor.www)
- Click on "Settings" tab
- Click on "Environment Variables" in the left sidebar

### 2. Add These Variables

#### OpenAI API Key (Required for Chat)
```
Name: OPENAI_API_KEY
Value: sk-proj-[your_openai_api_key_here]
Environment: Production, Preview, Development
```
**Note:** Use the API key from your `.env.local` file

#### Resend API Key (Required for Contact Form)
```
Name: RESEND_API_KEY
Value: re_[your_resend_api_key_here]
Environment: Production, Preview, Development
```
**Note:** Use the API key from your `.env.local` file

### 3. Redeploy

After adding the environment variables:
- Go to the "Deployments" tab
- Click on the three dots (...) on the latest deployment
- Click "Redeploy"
- Or just push a new commit to trigger a deployment

### Important Notes

1. **Security**: These API keys are already configured in your `.env.local` file which is NOT committed to git (it's in .gitignore)

2. **Email Address**: The contact form sends emails to `andor@agentoverlay.com`. If you want to change this:
   - Edit `src/app/api/contact/route.ts`
   - Change the `to` field to your preferred email
   - Make sure the email is verified in your Resend account

3. **Custom Domain Email**: To use a custom "from" address like `contact@andor.us`:
   - Verify your domain in Resend: https://resend.com/domains
   - Add DNS records they provide
   - Update the `from` field in `src/app/api/contact/route.ts`

## Getting Your API Keys

Your API keys are stored in your local `.env.local` file (not committed to git).

To find them:
1. Open `.env.local` in your project root
2. Copy the values for `OPENAI_API_KEY` and `RESEND_API_KEY`
3. Add them to Vercel's environment variables

**Never commit API keys to git!** They should only be in:
- Your local `.env.local` file
- Vercel's environment variables dashboard

## Testing After Deployment

1. Wait for deployment to complete
2. Visit your production URL
3. Test the chat by asking "What do you know about security?"
4. Test the contact form by asking "How do I contact you?"
5. Fill out the form and check your email at andor@agentoverlay.com

## Troubleshooting

If the chat doesn't work:
- Check that OPENAI_API_KEY is set correctly
- Check the Vercel function logs for errors

If the contact form doesn't work:
- Check that RESEND_API_KEY is set correctly
- Verify you're sending to andor@agentoverlay.com (your verified email in Resend)
- Check the Vercel function logs for errors
