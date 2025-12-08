<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Yolka Fest Registration

Registration portal for the Yolka Dance Festival. Register for Hip-Hop and Breaking nominations.

## Security Notice

⚠️ **IMPORTANT**: This application is designed to work with environment variables for API keys and tokens. 
For production deployment, you must configure the following environment variables:

- `VITE_GEMINI_API_KEY` - for AI hype message generation
- `VITE_YANDEX_DISK_TOKEN` - for saving registrations to Yandex Disk

**Never commit actual API keys to version control.**

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file with your API keys:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_YANDEX_DISK_TOKEN=your_yandex_disk_token_here
   ```
3. Run the app:
   `npm run dev`

## Production Deployment

This application is configured for GitHub Pages deployment via the workflow in `.github/workflows/deploy.yml`.
To deploy, ensure your environment variables are configured in your GitHub repository secrets:

- `VITE_GEMINI_API_KEY`
- `VITE_YANDEX_DISK_TOKEN`

Then push to the main branch to trigger the deployment workflow.
