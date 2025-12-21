'use client';

import Link from 'next/link';
import { ChevronDown, Search, X } from 'lucide-react';

// Type definitions
interface Endpoint {
  name: string;
  desc: string;
  method: string;
  status: string;
  path: string;
}

interface EndpointsData {
  [categorySlug: string]: Endpoint[];
}

// Mock data
const endpointsData: EndpointsData = {
  "random": [
    { name: "Blue Archive", desc: "Random foto blue archive", method: "GET", status: "Active", path: "/api/random/ba" },
    { name: "Random Waifu", desc: "Random foto waifu", method: "GET", status: "Active", path: "/api/random/waifu" },
    { name: "Pap Ayang", desc: "Random pap ayang", method: "GET", status: "Active", path: "/api/random/papayang" }
  ],
  "tools": [
    { name: "Unblur", desc: "Convert image to unblur", method: "GET", status: "Active", path: "/api/tools/unblur?url=" }
  ]
};

export default function CategoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState('');

  // Get category from URL params
  const categorySlug = router.query.slug as string;
  const category = endpointsData[categorySlug as keyof EndpointsData];
  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';

  const toggleAccordion = (slug: string) => {
    setOpenAccordion(openAccordion === slug ? null : slug);
  };

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(''), 2000);
  };

  // Filter endpoints based on search
  const filteredEndpoints = category?.filter((endpoint) =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-[#181818] text-gray-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-gray-400">The requested category does not exist.</p>
          <Link
            href="/docs/category"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-gray-200 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#181818]/95 backdrop-blur-sm border-b border-[#2E2E2E]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#212121] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📁</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {categoryTitle}
            </h1>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
            <span>root@slowly:~/docs/categories</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#212121] border border-[#2E2E2E] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-2">
          {filteredEndpoints.map((endpoint, index) => (
            <div
              key={endpoint.name}
              className="w-full bg-[#181818] border border-[#2E2E2E] p-4 flex justify-between items-center hover:bg-[#212121] transition-colors cursor-pointer rounded-lg"
              onClick={() => toggleAccordion(endpoint.name)}
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">{endpoint.name}</h3>
                <span className="bg-[#212121] border border-[#333] text-xs text-gray-400 px-2 py-1 rounded">
                  {endpoint.method?.toUpperCase() || 'GET'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(endpoint.path)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedPath === endpoint.path ? (
                    <>
                      <X className="w-4 h-4" />
                      <span className="ml-2 text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Accordion Content */}
            {openAccordion === endpoint.name && (
              <div className="mt-2 bg-[#111] border border-[#2E2E2E] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-mono text-gray-400">{endpoint.path}</h4>
                  <button
                    onClick={() => setOpenAccordion(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-sm text-gray-300">
                  <p><strong>Method:</strong> {endpoint.method?.toUpperCase() || 'GET'}</p>
                  <p><strong>Description:</strong> {endpoint.desc}</p>
                  {endpoint.params && (
                    <p><strong>Parameters:</strong></p>
                    <pre className="bg-[#181818] p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(endpoint.params, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}