"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, Play, Copy, Code, Terminal, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: string;
}

interface Endpoint {
  name: string;
  description: string;
  method: string | string[];
  status: string;
  endpoint: string;
  params?: Record<string, any>;
}

interface EndpointPlaygroundProps {
  endpoint: Endpoint;
  category?: string;
}

export default function EndpointPlayground({ endpoint, category }: EndpointPlaygroundProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [responseType, setResponseType] = useState<'json' | 'text' | 'image' | 'blob' | 'error' | null>(null);
  const [copiedTab, setCopiedTab] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>("");

  // Dynamic base URL based on current domain
  useEffect(() => {
    // Automatically grabs "http://localhost:3000" or "https://your-site.com"
    setBaseUrl(window.location.origin);
  }, []);

  // Initialize inputs with default values
  useEffect(() => {
    if (endpoint.params) {
      const defaultInputs: Record<string, string> = {};
      Object.entries(endpoint.params).forEach(([paramName, paramConfig]) => {
        if (paramConfig && typeof paramConfig === 'object' && 'default' in paramConfig) {
          defaultInputs[paramName] = paramConfig.default;
        }
      });
      setInputs(defaultInputs);
    }
  }, [endpoint.params]);

  // Handle input changes
  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // Build query string for GET requests
  const buildQueryString = (params: Record<string, string>): string => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim() !== "") {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  };

  // Build body for POST requests
  const buildBody = (params: Record<string, string>): Record<string, string> => {
    const body: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim() !== "") {
        body[key] = value;
      }
    });
    return body;
  };

  // Execute API request directly (no proxy needed for same domain)
  const handleExecute = async () => {
    // Validate API Key - MANDATORY
    if (!apiKey.trim()) {
      setResponse("API Key is required. Please enter your API key to continue.");
      setResponseType('error');
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseType(null);

    // Get the method from endpoint (handle array or string)
    const method = Array.isArray(endpoint.method) ? endpoint.method[0] : endpoint.method || "GET";

    try {
      // Construct full URL dynamically
      let fullUrl = `${baseUrl}${endpoint.endpoint}`;
      
      // Prepare headers - API Key is MANDATORY
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-api-key": apiKey.trim(), // Always include API key in headers
      };

      // Handle GET vs POST
      let fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: headers,
      };

      if (method.toUpperCase() === "GET") {
        // Add query parameters (API key is always included)
        const queryParams = { ...inputs };
        queryParams.apikey = apiKey.trim(); // Always include API key in query params
        
        const queryString = buildQueryString(queryParams);
        if (queryString) {
          fullUrl += `?${queryString}`;
        }
      } else {
        // Add body for POST requests
        fetchOptions.body = JSON.stringify(buildBody(inputs));
      }

      console.log("Making direct request:", { fullUrl, fetchOptions });

      // Make DIRECT request (no proxy needed for same domain)
      const response = await fetch(fullUrl, fetchOptions);
      
      const contentType = response.headers.get("content-type") || "";
      const status = response.status;

      // Handle Image/Binary responses
      if (contentType.includes("image")) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setResponse(base64data);
          setResponseType('image');
        };
        reader.readAsDataURL(blob);
        setLoading(false);
        return;
      }

      // Handle JSON responses
      if (contentType.includes("json")) {
        try {
          const data = await response.json();
          setResponse(data);
          setResponseType('json');
        } catch (jsonError) {
          // If JSON parsing fails, treat as text
          const text = await response.text();
          setResponse(text);
          setResponseType('text');
        }
      } else {
        // Handle Text responses (HTML, XML, plain text, etc.)
        const text = await response.text();
        setResponse(text);
        setResponseType('text');
      }

      // Handle HTTP errors
      if (!response.ok) {
        setResponseType('error');
        if (responseType !== 'json') {
          setResponse(`HTTP ${status}: ${response.statusText}`);
        }
      }

    } catch (error) {
      console.error("Execution error:", error);
      setResponse(error instanceof Error ? error.message : "An unexpected error occurred");
      setResponseType('error');
    } finally {
      setLoading(false);
    }
  };

  // Generate cURL command with dynamic base URL
  const generateCurl = (): string => {
    const method = Array.isArray(endpoint.method) ? endpoint.method[0] : endpoint.method || "GET";
    const dynamicBaseUrl = baseUrl || "/api"; // Fallback for loading state
    
    // Validate API key for code generation
    const currentApiKey = apiKey.trim() || "YOUR_API_KEY";
    
    let curl = `# ${endpoint.description}\n`;
    curl += `# Method: ${method.toUpperCase()}\n`;
    curl += `# Endpoint: ${dynamicBaseUrl}${endpoint.endpoint}\n\n`;
    
    curl += `curl -X ${method.toUpperCase()} \\\n`;
    curl += `  '${dynamicBaseUrl}${endpoint.endpoint}' \\\n`;
    curl += `  -H 'Content-Type: application/json' \\\n`;
    curl += `  -H 'x-api-key: ${currentApiKey}'`;
    
    // Add body for POST requests
    if (method.toUpperCase() === "POST") {
      const body = buildBody(inputs);
      if (Object.keys(body).length > 0) {
        curl += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
      }
    } else {
      // Add query parameters for GET requests
      const queryParams = { ...inputs };
      queryParams.apikey = currentApiKey;
      
      const queryString = buildQueryString(queryParams);
      if (queryString) {
        curl = `# ${endpoint.description}\n`;
        curl += `# Method: ${method.toUpperCase()}\n`;
        curl += `# Endpoint: ${dynamicBaseUrl}${endpoint.endpoint}\n\n`;
        curl += `curl -X ${method.toUpperCase()} \\\n`;
        curl += `  '${dynamicBaseUrl}${endpoint.endpoint}?${queryString}' \\\n`;
        curl += `  -H 'Content-Type: application/json' \\\n`;
        curl += `  -H 'x-api-key: ${currentApiKey}'`;
      }
    }
    
    return curl;
  };

  // Generate Node.js code with dynamic base URL
  const generateNode = (): string => {
    const method = Array.isArray(endpoint.method) ? endpoint.method[0] : endpoint.method || "GET";
    const dynamicBaseUrl = baseUrl || "/api"; // Fallback for loading state
    
    // Validate API key for code generation
    const currentApiKey = apiKey.trim() || "YOUR_API_KEY";
    
    let code = `/**\n`;
    code += ` * ${endpoint.description}\n`;
    code += ` * Method: ${method.toUpperCase()}\n`;
    code += ` * Endpoint: ${dynamicBaseUrl}${endpoint.endpoint}\n`;
    code += ` */\n\n`;
    
    code += `const fetch = require('node-fetch');\n\n`;
    code += `const execute = async () => {\n`;
    code += `  const url = '${dynamicBaseUrl}${endpoint.endpoint}';\n`;
    code += `  const headers = {\n`;
    code += `    'Content-Type': 'application/json',\n`;
    code += `    'x-api-key': '${currentApiKey}', // API Key is REQUIRED\n`;
    code += `  };\n\n`;
    
    if (method.toUpperCase() === "GET") {
      code += `  let fullUrl = url;\n`;
      const queryParams = { ...inputs };
      queryParams.apikey = currentApiKey;
      
      const queryString = buildQueryString(queryParams);
      if (queryString) {
        code += `  const params = new URLSearchParams({\n`;
        Object.entries(inputs).forEach(([key, value], index) => {
          if (value.trim() !== "") {
            code += `    '${key}': '${value}'${index < Object.entries(inputs).filter(([_, v]) => v.trim()).length - 1 ? ',' : ''}\n`;
          }
        });
        code += `    'apikey': '${currentApiKey}'\n`;
        code += `  });\n`;
        code += `  fullUrl += '?' + params.toString();\n`;
      }
      code += `  \n  const response = await fetch(fullUrl, { method: 'GET', headers });\n`;
    } else {
      const body = buildBody(inputs);
      code += `  const body = ${JSON.stringify(body, null, 2)};\n\n`;
      code += `  const response = await fetch(url, {\n`;
      code += `    method: 'POST',\n`;
      code += `    headers,\n`;
      code += `    body: JSON.stringify(body)\n`;
      code += `  });\n`;
    }
    
    code += `  \n  if (!response.ok) {\n`;
    code += `    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);\n`;
    code += `  }\n`;
    code += `  \n  const data = await response.json();\n`;
    code += `  console.log('Response:', data);\n`;
    code += `  return data;\n`;
    code += `};\n\n`;
    code += `// Execute the function\n`;
    code += `execute().catch(console.error);`;
    
    return code;
  };

  // Generate Python code with dynamic base URL
  const generatePython = (): string => {
    const method = Array.isArray(endpoint.method) ? endpoint.method[0] : endpoint.method || "GET";
    const dynamicBaseUrl = baseUrl || "/api"; // Fallback for loading state
    
    // Validate API key for code generation
    const currentApiKey = apiKey.trim() || "YOUR_API_KEY";
    
    let code = `"""\n`;
    code += `${endpoint.description}\n`;
    code += `Method: ${method.toUpperCase()}\n`;
    code += `Endpoint: ${dynamicBaseUrl}${endpoint.endpoint}\n`;
    code += `"""\n\n`;
    
    code += `import requests\n`;
    code += `import json\n`;
    code += `from urllib.parse import urlencode\n\n`;
    
    if (method.toUpperCase() === "GET") {
      code += `# Base URL and headers\n`;
      code += `url = '${dynamicBaseUrl}${endpoint.endpoint}'\n`;
      code += `headers = {\n`;
      code += `    'Content-Type': 'application/json',\n`;
      code += `    'x-api-key': '${currentApiKey}'  # API Key is REQUIRED\n`;
      code += `}\n\n`;
      
      code += `# Query parameters\n`;
      code += `params = {\n`;
      Object.entries(inputs).forEach(([key, value], index) => {
        if (value.trim() !== "") {
          code += `    '${key}': '${value}'${index < Object.entries(inputs).filter(([_, v]) => v.trim()).length - 1 ? ',' : ''}\n`;
        }
      });
      code += `    'apikey': '${currentApiKey}'\n`;
      code += `}\n\n`;
      
      code += `# Make the request\n`;
      code += `response = requests.get(url, headers=headers, params=params)\n`;
    } else {
      code += `# Base URL and headers\n`;
      code += `url = '${dynamicBaseUrl}${endpoint.endpoint}'\n`;
      code += `headers = {\n`;
      code += `    'Content-Type': 'application/json',\n`;
      code += `    'x-api-key': '${currentApiKey}'  # API Key is REQUIRED\n`;
      code += `}\n\n`;
      
      code += `# Request body\n`;
      code += `data = {\n`;
      Object.entries(inputs).forEach(([key, value], index) => {
        if (value.trim() !== "") {
          code += `    '${key}': '${value}'${index < Object.entries(inputs).filter(([_, v]) => v.trim()).length - 1 ? ',' : ''}\n`;
        }
      });
      code += `}\n\n`;
      
      code += `# Make the request\n`;
      code += `response = requests.post(url, headers=headers, json=data)\n`;
    }
    
    code += `\n# Handle response\n`;
    code += `if response.status_code >= 400:\n`;
    code += `    print(f"Error {response.status_code}: {response.text}")\n`;
    code += `    response.raise_for_status()\n\n`;
    
    code += `# Parse and display response\n`;
    code += `result = response.json()\n`;
    code += `print(json.dumps(result, indent=2))\n`;
    
    return code;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Render response based on type
  const renderResponse = () => {
    if (!response) return null;

    switch (responseType) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Image loaded successfully
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={response} 
                alt="API Response" 
                className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
        );
      
      case 'json':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                JSON response loaded successfully
              </span>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(JSON.stringify(response, null, 2), 'response')}
              >
                {copiedTab === 'response' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Text response loaded successfully
              </span>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                <code>{response}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(response, 'response')}
              >
                {copiedTab === 'response' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {response}
            </AlertDescription>
          </Alert>
        );
      
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown response type: {responseType}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          API Playground
        </CardTitle>
        <CardDescription>
          Test the {endpoint.description} endpoint directly from your browser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Input - MANDATORY */}
        <div className="space-y-2">
          <Label htmlFor="api-key" className="flex items-center gap-2">
            API Key
            <Badge variant="destructive" className="text-xs">
              REQUIRED
            </Badge>
          </Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your API key (required for all requests)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono border-red-200 focus:border-red-400 dark:border-red-800 dark:focus:border-red-600"
          />
          <p className="text-xs text-red-600 dark:text-red-400">
            ⚠️ API Key is required for all API requests. Get your API key from the dashboard.
          </p>
        </div>

        {/* Parameters */}
        {endpoint.params && Object.keys(endpoint.params).length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Parameters</Label>
            <div className="grid gap-4">
              {Object.entries(endpoint.params).map(([paramName, paramConfig]) => {
                const config = typeof paramConfig === 'object' ? paramConfig : { type: 'string', required: false };
                return (
                  <div key={paramName} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={paramName} className="font-mono text-sm">
                        {paramName}
                      </Label>
                      <Badge variant={config.required ? "destructive" : "secondary"}>
                        {config.type || 'string'}
                      </Badge>
                      {config.required && <Badge variant="outline">Required</Badge>}
                    </div>
                    <Input
                      id={paramName}
                      type={config.type?.toLowerCase() === "password" ? "password" : "text"}
                      placeholder={config.description || `Enter ${paramName}`}
                      value={inputs[paramName] || ""}
                      onChange={(e) => handleInputChange(paramName, e.target.value)}
                      className="font-mono"
                    />
                    {config.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {config.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <Button 
          onClick={handleExecute} 
          disabled={loading || !baseUrl}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute {Array.isArray(endpoint.method) ? endpoint.method[0].toUpperCase() : endpoint.method?.toUpperCase() || 'GET'} Request
            </>
          )}
        </Button>

        {/* Response */}
        {response && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Response</Label>
            {renderResponse()}
          </div>
        )}

        {/* Code Examples */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Code Examples</Label>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                cURL
              </TabsTrigger>
              <TabsTrigger value="node" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Node.js
              </TabsTrigger>
              <TabsTrigger value="python" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Python
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl" className="space-y-2">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generateCurl()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateCurl(), 'curl')}
                >
                  {copiedTab === 'curl' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="node" className="space-y-2">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generateNode()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateNode(), 'node')}
                >
                  {copiedTab === 'node' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="python" className="space-y-2">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generatePython()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatePython(), 'python')}
                >
                  {copiedTab === 'python' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}