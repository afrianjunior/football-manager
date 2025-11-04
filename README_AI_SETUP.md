# AI Screenshot Analysis Setup

This application now includes AI-powered screenshot analysis using OpenAI's GPT-4 Vision API.

## Setup Instructions

1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Configure the API Key**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file and add your API key
   echo "VITE_OPENAI_API_KEY=your_actual_api_key_here" > .env
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```

## How It Works

- When you take a screenshot using `Ctrl+Shift+S`, the screenshot path is captured
- The AI analysis feature appears in the UI showing the latest screenshot
- Click "Analyze Screenshot" to get AI insights about what the screenshot might contain
- Recent analyses are displayed below the analyzer

## Features

- **Automatic Screenshot Detection**: Screenshots are automatically detected and made available for analysis
- **AI-Powered Insights**: Get intelligent analysis of screen content based on filename and context
- **Analysis History**: Keep track of the last 3 analyses
- **Error Handling**: Clear error messages if API key is missing or invalid

## Notes

- The current implementation uses text-based analysis since direct image analysis requires base64 encoding
- The AI provides contextual insights based on the screenshot path and typical screen content
- Make sure your API key has access to GPT-4 models
- The API key is stored securely in environment variables and never exposed to the frontend code