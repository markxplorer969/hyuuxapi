'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Play, Plus, Trash2, Copy, Loader2, Code, Terminal } from 'lucide-react';

interface Param {
  key: string;
  value: string;
}

interface ApiResponse {
  [key: string]: any;
}

export default function TryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State management
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [url, setUrl] = useState('');
  const [params, setParams] = useState<Param[]>([]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');

  // Initialize from URL params
  useEffect(() => {
    const pathParam = searchParams.get('path');
    const methodParam = searchParams.get('method');
    
    if (pathParam) {
      setUrl(`/api/${pathParam}`);
    }
    
    if (methodParam && (methodParam === 'GET' || methodParam === 'POST')) {
      setMethod(methodParam);
    }
  }, [searchParams]);

  // Add parameter
  const addParameter = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  // Remove parameter
  const removeParameter = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  // Update parameter
  const updateParameter = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  // Generate code based on language
  const generateCode = (lang: 'curl' | 'node' | 'python'): string => {
    const paramString = params
      .filter(p => p.key && p.value)
      .map(p => `${p.key}=${encodeURIComponent(p.value)}`)
      .join('&');
    
    const fullUrl = paramString ? `${url}?${paramString}` : url;
    const jsonData = params.length > 0 
      ? JSON.stringify(params.reduce((acc, p) => {
          if (p.key && p.value) {
            acc[p.key] = p.value;
          }
          return acc;
        }, {} as Record<string, string>))
      : '';

    switch (lang) {
      case 'curl':
        return `curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/json"${jsonData ? ' \\\n  -d ' + jsonData + '"' : ''}`;

      case 'node':
        return `const response = await fetch("${fullUrl}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"
  }${jsonData ? ',\n  body: ' + jsonData : ''}
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests
import json

url = "${fullUrl}"
headers = {"Content-Type": "application/json"}

response = requests.${method.toLowerCase()}(url${jsonData ? ', data=' + jsonData : ''}, headers=headers)

data = response.json()
print(data)`;

      default:
        return '';
    }
  };

  // Execute request
  const executeRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const paramString = params
        .filter(p => p.key && p.value)
        .map(p => `${p.key}=${encodeURIComponent(p.value)}`)
        .join('&');
      
      const fullUrl = paramString ? `${url}?${paramString}` : url;
      
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (params.length > 0 && method === 'POST') {
        fetchOptions.body = JSON.stringify(
          params.reduce((acc, p) => {
            if (p.key && p.value) {
              acc[p.key] = p.value;
            }
            return acc;
          }, {} as Record<string, string>)
        );
      }

      const res = await fetch(fullUrl, fetchOptions);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-gray-200 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API Playground</h1>
          <p className="text-gray-400">Test API endpoints with custom parameters</p>
        </div>

        {/* Section A: Endpoint Config */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Method Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Method
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMethod('GET')}
                  className={`px-4 py-2 rounded-md border transition-all ${
                    method === 'GET'
                      ? 'bg-[#0a0a0a] border-white text-white'
                      : 'bg-[#212121] border-[#333] text-gray-400 hover:bg-white hover:text-black'
                  }`}
                >
                  GET
                </button>
                <button
                  onClick={() => setMethod('POST')}
                  className={`px-4 py-2 rounded-md border transition-all ${
                    method === 'POST'
                      ? 'bg-[#0a0a0a] border-white text-white'
                      : 'bg-[#212121] border-[#333] text-gray-400 hover:bg-white hover:text-black'
                  }`}
                >
                  POST
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Endpoint URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/api/example/endpoint"
                className="w-full bg-[#0a0a0a] border border-[#333] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section B: Parameters */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Parameters</h2>
              <button
                onClick={addParameter}
                className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#444] text-gray-400 hover:border-[#666] hover:text-white transition-all rounded-md text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Parameter
              </button>
            </div>

            {/* Parameter List */}
            <div className="space-y-3">
              {params.map((param, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => updateParameter(index, 'key', e.target.value)}
                    placeholder="Parameter name"
                    className="flex-1 bg-[#0a0a0a] border border-[#333] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateParameter(index, 'value', e.target.value)}
                    placeholder="Parameter value"
                    className="flex-1 bg-[#0a0a0a] border border-[#333] text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeParameter(index)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {params.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No parameters added. Click "Add Parameter" to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section C: Action */}
        <div className="text-center mb-6">
          <button
            onClick={executeRequest}
            disabled={isLoading || !url}
            className="flex items-center justify-center gap-2 w-full bg-[#212121] border border-[#2E2E2E] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-4 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Run Request</span>
              </>
            )}
          </button>
        </div>

        {/* Section D: Code & Response */}
        {(url || response) && (
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-lg overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-[#2E2E2E]">
              {(['curl', 'node', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === lang
                      ? 'bg-[#0a0a0a] text-white border-b-2 border-white'
                      : 'bg-[#181818] text-gray-400 hover:text-gray-300 hover:bg-[#1f1f1f]'
                  }`}
                >
                  {lang === 'curl' && (
                    <div className="flex items-center justify-center gap-2">
                      <Terminal className="w-4 h-4" />
                      cURL
                    </div>
                  )}
                  {lang === 'node' && (
                    <div className="flex items-center justify-center gap-2">
                      <Code className="w-4 h-4" />
                      Node.js
                    </div>
                  )}
                  {lang === 'python' && (
                    <div className="flex items-center justify-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Python
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Code Block */}
              <div className="bg-[#0a0a0a] p-6 border-r border-[#2E2E2E]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 uppercase font-bold">Code</span>
                  <button
                    onClick={() => copyCode(generateCode(activeTab))}
                    className="text-gray-400 hover:text-white transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                  {generateCode(activeTab)}
                </pre>
              </div>

              {/* Response Block */}
              <div className="bg-[#0a0a0a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 uppercase font-bold">Response</span>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                ) : response ? (
                  <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Execute a request to see the response
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}