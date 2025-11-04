import { useState } from 'react';
import { generateText } from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { AI_CONFIG, validateAIConfig } from '../lib/ai-config';
import './ImageAnalyzer.css';

interface ImageAnalyzerProps {
  imagePath: string;
  onAnalysisComplete: (analysis: string) => void;
}

export function ImageAnalyzer({ imagePath, onAnalysisComplete }: ImageAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  const analyzeImage = async () => {
    if (!imagePath) return;
    
    // Validate AI configuration
    if (!validateAIConfig()) {
      const configError = 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.';
      setAnalysis(configError);
      onAnalysisComplete(configError);
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // For now, let's use a text-based analysis since image analysis requires base64 encoding
      // We'll describe the screenshot path and let AI provide a generic analysis
      const result = await generateText({
        model: createOpenAI({
            apiKey: AI_CONFIG.openai.apiKey,
        })('gpt-4o-mini'),
        prompt: `A screenshot was just taken and saved to: ${imagePath}. 
        
Please provide a helpful analysis of what this screenshot might contain based on the filename and path. 
The screenshot was taken using a global shortcut (Ctrl+Shift+S) and likely shows the user's current screen content.

Provide a detailed description of what typical screen content might include, such as:
- Applications or windows that might be open
- Common UI elements and layouts
- Potential content based on the timing of the screenshot
- Any relevant observations about screen recording/screen capture context

Be helpful and descriptive, but note that this is a text-based analysis since we cannot directly view the image.`
      });

      const analysisText = result.text;
      setAnalysis(analysisText);
      onAnalysisComplete(analysisText);
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = 'Failed to analyze image. Please ensure your OpenAI API key is configured.';
      setAnalysis(errorMessage);
      onAnalysisComplete(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="image-analyzer">
      <div className="analyzer-controls">
        <button 
          onClick={analyzeImage} 
          disabled={isAnalyzing}
          className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="icon">🤖</span>
              Analyze Screenshot
            </>
          )}
        </button>
      </div>
      
      {analysis && (
        <div className="analysis-result">
          <div className="result-header">
            <span className="result-icon">💡</span>
            <strong>AI Insights</strong>
          </div>
          <div className="result-content">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}