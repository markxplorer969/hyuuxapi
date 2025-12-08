"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST";

interface Endpoint {
  name: string;
  desc: string;
  method: Method;
  path: string;
  status: string;
}

interface ParamDef {
  name: string;
  required: boolean;
}

type CodeExampleType = "curl" | "fetch" | "axios" | "python" | "httpie";

export default function TryApiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <TryApiPageInner />
    </Suspense>
  );
}

function TryApiPageInner() {
  const searchParams = useSearchParams();

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({});

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseType, setResponseType] = useState("");

  const [codeType, setCodeType] = useState<CodeExampleType>("curl");
  const [codePickerOpen, setCodePickerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const name = searchParams.get("name");
    const path = searchParams.get("endpoint");
    const method = searchParams.get("method");

    if (!name || !path || !method) {
      setLoading(false);
      return;
    }

    const ep: Endpoint = {
      name,
      path,
      method: method.toUpperCase() as Method,
      desc: `${method.toUpperCase()} endpoint for ${name}`,
      status: "Active"
    };

    setEndpoint(ep);

    const params = extractParams(path);

    setQueryParams(
      params.reduce((acc, p) => {
        acc[p.name] = "";
        return acc;
      }, {} as Record<string, string>)
    );

    if (ep.method === "POST") {
      setBodyParams(
        params.reduce((acc, p) => {
          acc[p.name] = "";
          return acc;
        }, {} as Record<string, string>)
      );
    }

    setLoading(false);
  }, [searchParams]);

  const extractParams = (path: string): ParamDef[] => {
    if (!path.includes("?")) return [];
    const query = path.split("?")[1];

    return query
      .split("&")
      .map((pair) => {
        const [name] = pair.split("=");
        if (!name || name.toLowerCase() === "apikey") return null;
        return { name, required: true };
      })
      .filter(Boolean) as ParamDef[];
  };

  const buildQueryString = () => {
    const p = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, val]) => {
      if (val) p.append(key, val);
    });

    if (apiKey) p.append("apikey", apiKey);

    return p.toString() ? `?${p.toString()}` : "";
  };

  const runApi = async () => {
    if (!endpoint) return;

    if (!apiKey) {
      setApiError("API key is required.");
      return;
    }

    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const base = endpoint.path.split("?")[0];
      const url = `${base}${buildQueryString()}`;

      let options: RequestInit = {
        method: endpoint.method,
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        }
      };

      if (endpoint.method === "POST") {
        options.body = JSON.stringify(bodyParams);
      }

      const res = await fetch(url, options);

      const type = res.headers.get("content-type") || "";

      if (type.includes("application/json")) {
        setApiResponse(await res.json());
        setResponseType("json");
      } else if (type.includes("image/")) {
        setApiResponse(await res.blob());
        setResponseType("image");
      } else {
        setApiResponse(await res.text());
        setResponseType("text");
      }
    } catch (err: any) {
      setApiError(err.message);
    }

    setApiLoading(false);
  };

  const clearAll = () => {
    setQueryParams({});
    setBodyParams({});
    setApiResponse(null);
    setApiError(null);
    setResponseType("");
  };

  const codeExample = (): string => {
    if (!endpoint) return "";

    const base = endpoint.path.split("?")[0];
    const qs = buildQueryString().replace(apiKey, "YOUR_API_KEY");
    const url = `${origin}${base}${qs}`;
    const body = endpoint.method === "POST" ? JSON.stringify(bodyParams, null, 2) : null;

    switch (codeType) {
      case "curl":
        return `curl -X ${endpoint.method} "${url}" \\
  -H "x-api-key: YOUR_API_KEY"${body ? ` \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(bodyParams)}'` : ""}`;
      case "fetch":
        return `fetch("${url}", {
  method: "${endpoint.method}",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }${
    body
      ? `,
  body: JSON.stringify(${JSON.stringify(bodyParams, null, 2)})
`
      : ""
  }
}).then(r => r.json()).then(console.log);`;
      case "axios":
        return `axios({
  url: "${url}",
  method: "${endpoint.method}",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  }${
    body
      ? `,
  data: ${JSON.stringify(bodyParams, null, 2)}`
      : ""
  }
}).then(r => console.log(r.data));`;
      case "python":
        return `import requests

url = "${url}"
headers = {
  "x-api-key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${
          body ? `, json=${JSON.stringify(bodyParams, null, 2)}` : ""
        })
print(response.json())`;
      case "httpie":
        return `http ${endpoint.method} "${url}" \\
  x-api-key:YOUR_API_KEY${
    body ? ` \\
  <<< '${JSON.stringify(bodyParams)}'` : ""
  }`;
    }

    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Endpoint not found.
      </div>
    );
  }

  const paramDefs = extractParams(endpoint.path);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 pt-20 max-w-3xl space-y-10 pb-10">
        <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/docs")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to docs
        </Button>

        <section>
          <h1 className="text-2xl font-semibold">{endpoint.name}</h1>
          <p className="text-sm text-muted-foreground">{endpoint.desc}</p>

          <div className="mt-3 flex flex-col gap-2 rounded-md border bg-muted/40 px-3 py-3 text-sm">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[11px]",
                endpoint.method === "GET" && "border-emerald-500 text-emerald-500",
                endpoint.method === "POST" && "border-blue-500 text-blue-500"
              )}
            >
              {endpoint.method}
            </Badge>
            <code className="text-xs break-all">
              {origin}
              {endpoint.path.split("?")[0]}
            </code>
          </div>
        </section>

        {/* API KEY */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Authentication</h2>

          <Label className="text-xs">apikey *</Label>
          <div className="relative max-w-md">
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your API key..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* PARAMS */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Parameters</h2>

          {paramDefs.length === 0 ? (
            <p className="text-sm text-muted-foreground">This endpoint has no parameters.</p>
          ) : (
            <div className="space-y-4">
              {paramDefs.map((p) => (
                <div key={p.name} className="space-y-1">
                  <Label className="text-xs">{p.name} *</Label>

                  {endpoint.method === "POST" ? (
                    <Input
                      value={bodyParams[p.name] || ""}
                      onChange={(e) =>
                        setBodyParams((prev) => ({ ...prev, [p.name]: e.target.value }))
                      }
                      placeholder={`Enter ${p.name}...`}
                      className="max-w-md"
                    />
                  ) : (
                    <Input
                      value={queryParams[p.name] || ""}
                      onChange={(e) =>
                        setQueryParams((prev) => ({ ...prev, [p.name]: e.target.value }))
                      }
                      placeholder={`Enter ${p.name}...`}
                      className="max-w-md"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={runApi} disabled={apiLoading}>
              {apiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Test API
            </Button>

            <Button variant="outline" onClick={clearAll} disabled={apiLoading}>
              Clear input
            </Button>
          </div>
        </section>

        {/* CODE EXAMPLES */}
        <section className="space-y-3">
          <div className="flex justify-between">
            <h2 className="text-base font-semibold">Code Example</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCodePickerOpen(true)}>
                {codeType.toUpperCase()}
              </Button>

              <Button variant="outline" size="icon" onClick={() => copyText(codeExample())}>
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-950 text-slate-50">
            <pre className="p-4 text-xs whitespace-pre-wrap">{codeExample()}</pre>
          </div>

          {codePickerOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-40">
              <div className="bg-background w-full max-w-sm p-4 rounded-t-2xl shadow-lg">
                <div className="flex items-center justify-between pb-3">
                  <p>Pilih Bahasa</p>
                  <button onClick={() => setCodePickerOpen(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y rounded-lg border">
                  {(["curl", "fetch", "axios", "python", "httpie"] as CodeExampleType[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setCodeType(t);
                          setCodePickerOpen(false);
                        }}
                        className={cn(
                          "w-full flex justify-between px-4 py-3",
                          codeType === t && "bg-muted"
                        )}
                      >
                        {t.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RESPONSE */}
        <section className="space-y-3">
          <div className="flex justify-between">
            <h2 className="text-base font-semibold">Response</h2>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyResponse()}
              disabled={!apiResponse && !apiError}
            >
              {copiedResponse ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="rounded-lg border bg-slate-950 text-slate-50 h-96 overflow-auto p-4 text-xs">
            {!apiResponse && !apiError && <p>No response yet.</p>}

            {apiError && (
              <div className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {apiError}
              </div>
            )}

            {apiResponse && responseType === "json" && (
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            )}

            {apiResponse && responseType === "text" && <pre>{apiResponse}</pre>}

            {apiResponse && responseType === "image" && (
              <img
                src={URL.createObjectURL(apiResponse)}
                className="max-w-full max-h-full object-contain mx-auto"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1200);
  }

  function copyResponse() {
    if (apiResponse) {
      const text =
        typeof apiResponse === "string"
          ? apiResponse
          : JSON.stringify(apiResponse, null, 2);

      navigator.clipboard.writeText(text);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 1200);
    }
  }
}
