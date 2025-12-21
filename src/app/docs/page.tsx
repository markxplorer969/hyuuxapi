'use client';

import { useState } from 'react';
import { Copy, Terminal, Shield, Check, Info, Server, Globe } from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python">("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X GET "https://api.slowly.app/v2/status" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    js: `const response = await fetch("https://api.slowly.app/v2/status", {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`,
    python: `import requests

url = "https://api.slowly.app/v2/status"
headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json())`
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Documentation</h1>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-500 bg-[#212121]/50 w-fit px-4 py-2 rounded-lg border border-[#2E2E2E]">
          <span className="text-green-500">root@slowly:~/docs/intro</span>
          <span className="animate-pulse">_</span>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Welcome to Slowly API. A powerful, reliable, and easy-to-use REST API for developers.
          Retrieve data, process media, and integrate AI with just a few lines of code.
        </p>
      </div>

      {/* 2. Base URL Card */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-400" /> Base URL
        </h2>
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl p-6">
          <p className="text-gray-400 mb-4">All API requests must be directed to this root URL:</p>
          <div className="relative group">
            <div className="bg-[#0a0a0a] border border-[#2E2E2E] rounded-lg p-4 font-mono text-white text-sm flex items-center justify-between">
              <span>https://api.slowly.app/v2</span>
              <button 
                onClick={() => handleCopy("https://api.slowly.app/v2")}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Authentication Card */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" /> Authentication
        </h2>
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl p-6">
          <p className="text-gray-400 mb-6">We support two methods of authentication. The <span className="text-white font-medium">Header</span> method is recommended for security.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method A */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white uppercase tracking-wider">Option 1: Header (Best)</div>
              <div className="bg-[#0a0a0a] border border-[#2E2E2E] rounded-lg p-4 font-mono text-xs text-gray-300">
                x-api-key: YOUR_API_KEY
              </div>
            </div>
            
            {/* Method B */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white uppercase tracking-wider">Option 2: Query Param</div>
              <div className="bg-[#0a0a0a] border border-[#2E2E2E] rounded-lg p-4 font-mono text-xs text-gray-300">
                ?apikey=YOUR_API_KEY
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200 text-sm">
                <strong>Recommended:</strong> Use header method for better security and to avoid exposing your key in URLs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Example Request (Interactive) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-purple-400" /> Example Request
        </h2>
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2E2E2E]">
            {["curl", "js", "python"].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === lang 
                    ? "bg-[#212121] text-white border-b-2 border-white" 
                    : "bg-[#181818] text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f]"
                }`}
              >
                {lang === "curl" ? "cURL" : lang === "js" ? "JavaScript" : "Python"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Code View */}
            <div className="bg-[#0a0a0a] p-6 border-r border-[#2E2E2E] overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 uppercase font-bold">Request</span>
                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                  {codeSnippets[activeTab]}
                </pre>
              </div>
            </div>

            {/* Response Preview */}
            <div className="bg-[#0a0a0a] p-6 overflow-x-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 uppercase font-bold">Response</span>
                <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap">
                  {`{
  "status": true,
  "code": 200,
  "creator": "Slowly API",
  "result": {
    "server": "online",
    "ping": "14ms",
    "timestamp": 1709232000
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Status Codes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Server className="w-6 h-6 text-orange-400" /> Status Codes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { code: 200, label: "OK", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
            { code: 400, label: "Bad Request", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
            { code: 401, label: "Unauthorized", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
            { code: 429, label: "Rate Limit", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
          ].map((status) => (
            <div key={status.code} className={`p-4 rounded-lg border ${status.bg} ${status.border}`}>
              <div className={`text-2xl font-bold ${status.color} mb-1`}>{status.code}</div>
              <div className="text-sm text-gray-300 font-medium">{status.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}