# Setup Instructions

## Chat Feature Configuration

The chat feature on the homepage uses OpenAI's API to answer questions about your work, projects, and expertise.

### Setting up OpenAI API Key

1. Get an API key from OpenAI:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key (or use an existing one)

2. Add the API key to your environment:
   - Open the `.env.local` file in the root directory
   - Replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

## Contact Form Configuration

The contact form sends emails directly to contact@andor.us using Resend.

### Setting up Resend API Key

1. Create a Resend account:
   - Go to https://resend.com/signup
   - Sign up for a free account

2. Get your API key:
   - Go to https://resend.com/api-keys
   - Create a new API key

3. Add the API key to your environment:
   - Open the `.env.local` file in the root directory
   - Replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_...
   ```

4. (Optional) Verify your domain:
   - For production, verify your domain at https://resend.com/domains
   - Update the `from` address in `src/app/api/contact/route.ts` to use your verified domain
   - For development/testing, the default `onboarding@resend.dev` works fine

5. Restart the development server:
   ```bash
   pnpm run dev
   ```

### How it works

- The chat system uses GPT-4o-mini for responses
- It's constrained to only answer questions about your professional work
- The system will automatically extract and display relevant URLs as clickable source links
- If the API key is not configured, it falls back to the keyword-based response system

### Fallback Mode

If `OPENAI_API_KEY` is not set, the chat will use a simpler keyword-matching system. The LLM-based system provides:
- More natural, conversational responses
- Better understanding of context and intent
- Ability to answer complex questions about your work
- Automatic source link extraction

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

The site will be available at http://localhost:3000 (or the next available port).

## Features Implemented

- ✅ Parallax hero section with your speaking photo
- ✅ Auto-hiding header (shows on hover)
- ✅ Expandable/collapsible chat interface
- ✅ Voice input support (Web Speech API)
- ✅ LLM-powered chat with RAG (GPT-4o-mini)
- ✅ Clickable URLs and markdown links in chat messages
- ✅ Source citations for responses
- ✅ Smart contact form (appears in chat when asked about contact/hiring)
- ✅ Inline contact form integration
- ✅ Minimal, high-contrast design
- ✅ JetBrains Mono typography
- ✅ Responsive mobile layout

## How the Contact Form Works

When users ask contact-related questions (e.g., "How do I contact you?", "I want to hire you", "Let's get in touch"), the chat will:
1. Provide an answer with contact information
2. Automatically display an inline contact form in the chat after 0.5 seconds
3. Allow users to fill out and submit their information directly in the conversation

The form integrates with your CRM API endpoint and provides immediate feedback on submission.
