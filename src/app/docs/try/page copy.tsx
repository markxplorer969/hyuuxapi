'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect, Suspense } from 'react';
import {
  ArrowLeft,
  Play,
  Loader2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface Endpoint {
  name: string;
  desc: string;
  method: string;
  status: string;
  path: string;
}

interface ParamDef {
  name: string;
  required: boolean;
}

type CodeExampleType = 'curl' | 'fetch' | 'axios' | 'python' | 'httpie';

// ---------------------------------------------------------------------
// Wrapper with Suspense (required for useSearchParams in App Router)
// ---------------------------------------------------------------------
export default function TryApiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>}>
      <TryApiPageInner />
    </Suspense>
  );
}

// ---------------------------------------------------------------------
// Inner page component
// ---------------------------------------------------------------------
function TryApiPageInner() {
  const searchParams = useSearchParams();

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);

  const [origin, setOrigin] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [apiLoading, setApiLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<string>('');

  const [codeType, setCodeType] = useState<CodeExampleType>('curl');
  const [codePickerOpen, setCodePickerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const endpointName = searchParams.get('name');
    const endpointPath = searchParams.get('endpoint');
    const method = searchParams.get('method');

    if (endpointName && endpointPath && method) {
      setEndpoint({
        name: endpointName,
        path: endpointPath,
        method: method.toUpperCase(),
        desc: `${method.toUpperCase()} endpoint for ${endpointName}`,
        status: 'Active',
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // extract non-apikey query params from path
  const extractParameters = (path: string): ParamDef[] => {
    if (!path.includes('?')) return [];
    const query = path.split('?')[1];

    return query
      .split('&')
      .map((pair) => {
        const [name] = pair.split('=');
        if (!name) return null;
        if (name.toLowerCase() === 'apikey') return null;
        return { name, required: true };
      })
      .filter(Boolean) as ParamDef[];
  };

  // Build query string: selalu menyertakan apikey sebagai query param
  const buildQueryString = (includeRealValues = true) => {
    if (!endpoint) return '';

    const defs = extractParameters(endpoint.path);
    const params = new URLSearchParams();

    // normal params
    defs.forEach((def) => {
      const value = includeRealValues ? parameters[def.name] : parameters[def.name] || '';
      if (value) params.append(def.name, value);
    });

    // apikey selalu ditambahkan
    const apiKeyValue = includeRealValues ? apiKey : 'YOUR_API_KEY';
    if (apiKeyValue) params.append('apikey', apiKeyValue);

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const executeApiCall = async () => {
    if (!endpoint) return;

    // apikey wajib untuk semua endpoint
    if (!apiKey) {
      setApiError('API key is required.');
      return;
    }

    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    setResponseType('');

    try {
      const basePath = endpoint.path.split('?')[0];
      const queryString = buildQueryString(true);
      const url = `${basePath}${queryString}`;

      const response = await fetch(url, {
        method: endpoint.method as RequestInit['method'],
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      const contentType = response.headers.get('content-type') || '';
      let body: any;

      if (contentType.includes('application/json')) {
        body = await response.json();
        setResponseType('json');
      } else if (contentType.includes('image/')) {
        body = await response.blob();
        setResponseType('image');
      } else if (contentType.includes('text/html')) {
        body = await response.text();
        setResponseType('html');
      } else if (contentType.includes('text/')) {
        body = await response.text();
        setResponseType('text');
      } else {
        body = await response.text();
        setResponseType('raw');
      }

      setApiResponse(body);
    } catch (error: any) {
      setApiError(error?.message || 'Failed to execute API call');
    } finally {
      setApiLoading(false);
    }
  };

  const clearTry = () => {
    setParameters({});
    setApiKey('');
    setApiResponse(null);
    setApiError(null);
    setResponseType('');
    setCopiedResponse(false);
  };

  // ------------------------------------------------------
  // Code example generator
  // ------------------------------------------------------
  const generateCodeExample = (type: CodeExampleType): string => {
    if (!endpoint) return '';

    const basePath = endpoint.path.split('?')[0];
    const qsForSnippets = buildQueryString(false); // apikey -> YOUR_API_KEY
    const fullUrl = `${origin}${basePath}${qsForSnippets}`;

    if (type === 'curl') {
      let cmd = `curl -X ${endpoint.method} "${fullUrl}" \\\n  -H "x-api-key: YOUR_API_KEY"`;
      return cmd;
    }

    if (type === 'fetch') {
      return `fetch("${fullUrl}", {
  method: "${endpoint.method}",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }
})
  .then(res => res.json())
  .then(console.log);`;
    }

    if (type === 'axios') {
      return `import axios from "axios";

axios({
  url: "${fullUrl}",
  method: "${endpoint.method}",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  }
})
  .then(res => console.log(res.data));`;
    }

    if (type === 'python') {
      return `import requests

url = "${fullUrl}"
headers = {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_API_KEY"
}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)
print(response.json())`;
    }

    if (type === 'httpie') {
      return `http ${endpoint.method} "${fullUrl}" \\
  x-api-key:YOUR_API_KEY`;
    }

    return '';
  };

  const codeTypeLabel = (type: CodeExampleType) => {
    switch (type) {
      case 'curl':
        return 'cURL';
      case 'fetch':
        return 'JavaScript Fetch';
      case 'axios':
        return 'Axios';
      case 'python':
        return 'Python (requests)';
      case 'httpie':
        return 'HTTPie';
      default:
        return '';
    }
  };

  const handleCopyCode = async () => {
    const text = generateCodeExample(codeType);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const handleCopyResponse = async () => {
    if (!apiResponse && !apiError) return;

    try {
      let textToCopy = '';

      if (apiError) {
        textToCopy = apiError;
      } else if (responseType === 'image' && apiResponse instanceof Blob) {
        const url = URL.createObjectURL(apiResponse);
        textToCopy = url;
      } else if (typeof apiResponse === 'string') {
        textToCopy = apiResponse;
      } else {
        textToCopy = JSON.stringify(apiResponse, null, 2);
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 1500);
    } catch (e) {
      console.error('Failed to copy response', e);
    }
  };

  // ------------------------------------------------------
  // Render
  // ------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="space-y-2 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading endpoint…</p>
        </div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Endpoint not found</p>
          <p className="text-sm text-muted-foreground">
            Make sure you opened this page from the documentation list.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = '/docs')}
          >
            Back to docs
          </Button>
        </div>
      </div>
    );
  }

  const paramDefs = extractParameters(endpoint.path);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 pt-20 pb-8 space-y-8 max-w-3xl">
        {/* Back button (diturunkan dengan pt-20 di main) */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/docs')}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to docs
          </Button>
        </div>

        {/* Title & path */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{endpoint.name}</h1>
            <p className="text-sm text-muted-foreground">{endpoint.desc}</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  'font-mono text-[11px] px-2',
                  endpoint.method === 'GET' && 'border-emerald-500 text-emerald-500',
                  endpoint.method === 'POST' && 'border-blue-500 text-blue-500',
                )}
              >
                {endpoint.method}
              </Badge>
              <code className="font-mono break-all text-xs md:text-[13px]">
                {origin}
                {endpoint.path.split('?')[0]}
              </code>
            </div>
          </div>
        </section>

        {/* Authentication section (apikey) */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Authentication</h2>
          <p className="text-xs text-muted-foreground">
            All endpoints require your API key as query parameter and header.
          </p>
          <div className="space-y-1">
            <Label htmlFor="apikey" className="text-xs font-medium">
              apikey <span className="text-destructive">*</span>
            </Label>
            <div className="relative max-w-md">
              <Input
                id="apikey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your API key…"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* Parameters section */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Parameters</h2>
          {paramDefs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Besides <code className="text-xs">apikey</code>, this endpoint does not require
              additional parameters.
            </p>
          ) : (
            <div className="space-y-4">
              {paramDefs.map((param) => (
                <div key={param.name} className="space-y-1">
                  <Label htmlFor={`param-${param.name}`} className="text-xs font-medium">
                    {param.name}
                    {param.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={`param-${param.name}`}
                    value={parameters[param.name] || ''}
                    onChange={(e) =>
                      setParameters((prev) => ({
                        ...prev,
                        [param.name]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${param.name}…`}
                    className="max-w-md"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Test / Clear buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1 sm:flex-none sm:w-36"
              disabled={apiLoading}
              onClick={executeApiCall}
            >
              {apiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test API
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none sm:w-32"
              onClick={clearTry}
              disabled={apiLoading}
            >
              Clear input
            </Button>
          </div>
        </section>

        {/* Code examples */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Code example</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCodePickerOpen(true)}
                className="text-xs"
              >
                {codeTypeLabel(codeType)}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="h-8 w-8"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-slate-950 text-slate-50">
            <div className="h-64 overflow-auto p-4 text-xs font-mono">
              <pre className="whitespace-pre-wrap break-all">
                {generateCodeExample(codeType)}
              </pre>
            </div>
          </div>

          {/* Code type picker overlay */}
          {codePickerOpen && (
            <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
              <div className="w-full max-w-sm rounded-t-2xl bg-background p-4 shadow-lg sm:rounded-2xl">
                <div className="flex items-center justify-between pb-3">
                  <p className="text-sm font-medium">Pilih contoh kode</p>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setCodePickerOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {(['curl', 'fetch', 'axios', 'python', 'httpie'] as CodeExampleType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        className={cn(
                          'flex w-full items-center justify-between px-4 py-3 text-sm',
                          codeType === type && 'bg-muted',
                        )}
                        onClick={() => {
                          setCodeType(type);
                          setCodePickerOpen(false);
                          setCopiedCode(false);
                        }}
                      >
                        <span>{codeTypeLabel(type)}</span>
                        <span
                          className={cn(
                            'h-3 w-3 rounded-full border',
                            codeType === type
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-muted-foreground',
                          )}
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Response viewer */}
        <section className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Response</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px]">
                {responseType || 'none'}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopyResponse}
                disabled={!apiResponse && !apiError}
              >
                {copiedResponse ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-slate-950 text-slate-50">
            <div className="flex h-96 items-stretch justify-center overflow-hidden">
              {/* No response yet */}
              {!apiResponse && !apiError && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-xs text-slate-400">
                  <span>No response yet.</span>
                  <span>Run “Test API” to see the response from this endpoint.</span>
                </div>
              )}

              {/* Error */}
              {apiError && (
                <div className="flex-1 overflow-auto p-4">
                  <div className="mb-2 flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] text-red-200">
                    {apiError}
                  </pre>
                </div>
              )}

              {/* Response content */}
              {apiResponse && !apiError && responseType === 'image' && (
                <div className="flex flex-1 items-center justify-center bg-black">
                  <img
                    src={URL.createObjectURL(apiResponse)}
                    alt="API response"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              {apiResponse && !apiError && responseType !== 'image' && (
                <div className="flex-1 overflow-auto p-4">
                  <pre className="whitespace-pre text-[11px] leading-relaxed">
                    {typeof apiResponse === 'string'
                      ? apiResponse
                      : JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
