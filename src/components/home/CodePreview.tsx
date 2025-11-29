'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Terminal, Code, Zap, Play, FileText, Globe, Shield, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const codeExamples = {
  curl: {
    name: 'cURL',
    language: 'bash',
    code: `curl -X POST "https://api.slowly.dev/api/ai/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a Python function to calculate factorial",
    "model": "gpt-4"
  }'`
  },
  javascript: {
    name: 'JavaScript',
    language: 'javascript',
    code: `const response = await fetch('https://api.slowly.dev/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Write a Python function to calculate factorial',
    model: 'gpt-4'
  })
});

const data = await response.json();
console.log(data);`
  },
  python: {
    name: 'Python',
    language: 'python',
    code: `import requests
import json

def generate_content(prompt, model='gpt-4'):
    url = 'https://api.slowly.dev/api/ai/generate'
    headers = {
        'Content-Type': 'application/json'
    }
    
    data = {
        'prompt': prompt,
        'model': model
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    return result

# Example usage
result = generate_content('Write a Python function to calculate factorial')`
  }
};

export default function CodePreview() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('curl');

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Terminal className="w-5 h-5" />
          Interactive Code Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {Object.entries(codeExamples).map(([key, example]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2 data-[state=active]:text-blue-600">
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {key === 'curl' && <span className="text-xs font-bold">CURL</span>}
                  {key === 'javascript' && <span className="text-xs font-bold">JS</span>}
                  {key === 'python' && <span className="text-xs font-bold">PY</span>}
                </div>
                <span className="text-sm font-medium">{example.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {codeExamples[activeTab as keyof typeof codeExamples].name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {codeExamples[activeTab as keyof typeof codeExamples].language.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples].code)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedCode === codeExamples[activeTab as keyof typeof codeExamples].code ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900 dark:bg-black text-gray-100 dark:text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{codeExamples[activeTab as keyof typeof codeExamples].code}</code>
                </pre>
                
                {copiedCode === codeExamples[activeTab as keyof typeof codeExamples].code && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium animate-pulse">
                    Copied!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Quick API Reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Endpoint:</span>
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">POST /api/ai/generate</code>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Method:</span>
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">POST</code>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">Response:</span>
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">JSON Object</code>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300">Rate Limit:</span>
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded font-mono">100 req/min</code>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}