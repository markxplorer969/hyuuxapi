'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Check,
  Play,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Komponen Loading Terpusat
const CenteredLoader = ({ text = "Loading..." }: { text?: string }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-lg text-muted-foreground">{text}</p>
    </div>
);

// --- Komponen Sisi Klien Utama ---
function TryPageContent() {
  const params = useSearchParams();

  const category = params.get("category") || "";
  const key = params.get("key") || "";

  const [endpoint, setEndpoint] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [inputs, setInputs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false); // Status terpisah untuk 'Test'

  const [response, setResponse] = useState<any>(null);
  const [responseType, setResponseType] = useState("none");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/endpoints")
      .then((r) => r.json())
      .then((d) => {
        const data = d.result?.[category]?.[key];
        setEndpoint(data || null);

        if (data?.params) {
          const initial: any = {};
          Object.entries(data.params).forEach(([p, def]: [string, any]) => {
            initial[p] = def.default !== undefined ? String(def.default) : "";
          });
          setInputs(initial);
        }

        setLoading(false);
      })
      .catch(() => {
          setLoading(false);
          setError("Failed to fetch endpoint metadata.");
      });
  }, [category, key]);

  const run = async () => {
    if (!endpoint) return;
    if (!apiKey) {
        setError("API Key is required.");
        return;
    }

    setError("");
    setResponse(null);
    setResponseType("none");
    setRunning(true); // Mulai status Running

    const method = Array.isArray(endpoint.method)
      ? endpoint.method[0]
      : endpoint.method;

    const urlBase = endpoint.endpoint;

    const query = new URLSearchParams();
    const body: any = {};

    let hasError = false;

    Object.entries(inputs).forEach(([k, v]) => {
      const value = String(v ?? ''); 
      const paramDef = endpoint.params[k];
      if (!paramDef) return;
      
      if (paramDef.required && !value) {
        setError(`Parameter '${k}' is required.`);
        hasError = true;
        return;
      }
      
      if (method === "GET") {
          if (value) query.append(k, value);
      } else {
          // POST: Masukkan nilai ke body.
          body[k] = value;
      }
    });

    if (hasError) {
        setRunning(false);
        return;
    }

    // Hanya tambahkan API key ke query jika methodnya GET
    // Jika POST, API key akan dikirimkan melalui header 'x-api-key'
    if (method === "GET") {
        query.append("apikey", apiKey);
    } 

    // FINAL URL: Tidak ada query param lain selain yang diizinkan untuk GET
    const finalURL =
      method === "GET" ? `${urlBase}?${query.toString()}` : urlBase;
      
    try {
      const res = await fetch(finalURL, {
        method,
        headers: {
            // Penting: Kirim 'x-api-key' di header untuk semua method
            "x-api-key": apiKey,
            // Penting: Pastikan Content-Type untuk POST adalah JSON
            "Content-Type": "application/json", 
        },
        body: method === "POST" ? JSON.stringify(body) : undefined,
      });

      // Penanganan error status non-200
      if (!res.ok) {
        const type = res.headers.get("content-type") || "";
        let errorBody = `Status ${res.status}`;
        
        // Coba baca body untuk pesan error yang lebih detail
        try {
            if (type.includes("application/json")) {
                const jsonError = await res.json();
                errorBody += `: ${JSON.stringify(jsonError, null, 2)}`;
            } else {
                const textError = await res.text();
                // Batasi panjang teks HTML/Error untuk menghindari overflow
                errorBody += `: ${textError.substring(0, 200)}...`; 
            }
        } catch (e) {
            // Jika gagal membaca body, biarkan errorBody tetap status saja
        }

        setError(`Request failed: ${errorBody}`);
        return;
      }

      // Penanganan Response Sukses (res.ok)
      const type = res.headers.get("content-type") || "";
      if (type.includes("application/json")) {
        setResponse(await res.json());
        setResponseType("json");
      } else if (type.includes("image/")) {
        setResponse(await res.blob());
        setResponseType("image");
      } else {
        setResponse(await res.text());
        setResponseType("text");
      }
    } catch (err: any) {
      // Penanganan error network/cors
      setError(`Network Error: ${err.message}`);
    } finally {
      setRunning(false); // Akhiri status Running
    }
  };

  // Fungsi untuk menampilkan URL yang sedang dibangun (untuk cURL/kode)
  const finalUrlDisplay = () => {
      const urlBase = endpoint.endpoint;
      const query = new URLSearchParams();
      
      Object.entries(inputs).forEach(([k, v]) => {
        if (!endpoint.params[k]) return;
        const value = String(v ?? '');
        if (method === 'GET' && value) query.append(k, value);
      });
      
      // Tambahkan apikey ke URL tampilan jika GET
      if (method === 'GET' && apiKey) {
          query.append('apikey', apiKey);
      }
      // Tambahkan placeholder apikey jika kosong
      else if (method === 'GET' && !apiKey) {
          query.append('apikey', 'YOUR_API_KEY');
      }

      const queryString = query.toString();
      
      return `${urlBase}${queryString ? '?' + queryString : ''}`;
  }

  // Menampilkan Centered Loader jika Loading Metadata
  if (loading) return <CenteredLoader text="Fetching endpoint details..." />;

  // Cek jika endpoint tidak ditemukan
  if (!endpoint) return <div className="p-10 text-center text-lg text-red-500">Endpoint not found. Check category and key parameters.</div>;

  const method = Array.isArray(endpoint.method)
    ? endpoint.method[0]
    : endpoint.method;
    
  // --- Tampilan Utama ---
  return (
    <div className="min-h-screen px-4 pt-24 container max-w-3xl pb-20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (window.location.href = "/docs")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <h1 className="text-3xl font-bold">{endpoint.name}</h1>
      <p className="text-muted-foreground">{endpoint.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <Badge>{method}</Badge>
        <code className="text-sm text-muted-foreground break-all">
          {finalUrlDisplay()}
        </code>
      </div>

      {/* API KEY */}
      <div className="mt-8">
        <p className="font-semibold mb-1">API Key *</p>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Your API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PARAMS */}
      <div className="mt-8">
        <p className="font-semibold mb-3">{method === 'GET' ? 'Query Parameters' : 'Body Parameters'}</p>

        <div className="space-y-4">
          {Object.entries(endpoint.params || {}).map(([p, def]: any) => (
            <div key={p}>
              <p className="mb-1 font-medium">
                {p} {def.required && "*"}
              </p>
              <Input
                placeholder={`Enter ${p}... (${def.type})`}
                value={inputs[p]}
                onChange={(e) =>
                  setInputs({ ...inputs, [p]: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {def.type} {def.default !== undefined ? `(Default: ${String(def.default)})` : ''}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <Button onClick={run} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {running ? 'Running...' : 'Test'}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const cleared: any = {};
              Object.entries(endpoint.params || {}).forEach(([k, def]: [string, any]) => {
                  cleared[k] = def.default !== undefined ? String(def.default) : "";
              });
              setInputs(cleared);
              setResponse(null);
              setError("");
              setResponseType("none");
            }}
          >
            Clear
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={async () => {
                const url = finalUrlDisplay();
                let curl = `curl -X ${method} "${url}" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}"`;

                if (method === 'POST') {
                    curl += ` \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(inputs)}'`;
                }

                await navigator.clipboard.writeText(curl);
            }}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy cURL
          </Button>
        </div>
      </div>

      {/* RESPONSE */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Response</p>
            <Badge variant="secondary" className="text-xs">
                {responseType.toUpperCase()}
            </Badge>
        </div>

        <div className="bg-black/90 text-white rounded-lg p-4 max-h-[400px] overflow-auto relative">
          {error && (
            <p className="text-red-400 whitespace-pre-wrap">{error}</p>
          )}

          {!response && !error && (
            <p className="text-muted-foreground">No response yet.</p>
          )}

          {response && responseType === "json" && (
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}

          {response && responseType === "text" && (
            <pre className="whitespace-pre-wrap text-sm">{response}</pre>
          )}

          {response && responseType === "image" && (
            <div className="w-full h-full flex items-center justify-center">
                <img
                src={URL.createObjectURL(response)}
                className="max-w-full max-h-[360px] object-contain rounded-md"
                alt="API Response Image"
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Komponen Pembungkus Suspense ---
export default function TryPage() {
    return (
        <Suspense fallback={<CenteredLoader text="Loading page components..." />}>
            <TryPageContent />
        </Suspense>
    );
}