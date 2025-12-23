'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, Search, X, ArrowLeft, Bot, Download, Dices, Settings } from 'lucide-react';
import EndpointPlayground from '@/components/docs/EndpointPlayground';

// Icon mapping for categories
const iconMap: { [key: string]: any } = {
  'openai': Bot,
  'downloader': Download,
  'random': Dices,
  'api': Settings
};

// Type definitions
interface Endpoint {
  name: string;
  description: string;
  method: string | string[];
  status: string;
  endpoint: string;
  params: any;
}

interface CategoryData {
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  [key: string]: Endpoint | any;
}

interface EndpointsData {
  [categorySlug: string]: CategoryData;
}

export default function CategoryPage() {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState('');
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Get category from URL params
  const categorySlug = params.slug as string;

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch('/endpoints.json');
        const data: EndpointsData = await response.json();
        
        const categoryData = data[categorySlug];
        if (categoryData) {
          setCategory(categoryData);
          
          // Extract endpoints (exclude metadata fields)
          const endpointList = Object.values(categoryData).filter((item): item is Endpoint => 
            item && typeof item === 'object' && 'name' in item
          );
          
          setEndpoints(endpointList);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug]);

  const toggleAccordion = (slug: string) => {
    setOpenAccordion(openAccordion === slug ? null : slug);
  };

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(''), 2000);
  };

  // Filter endpoints based on search
  const filteredEndpoints = endpoints.filter((endpoint) =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-gray-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#181818] text-gray-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-gray-400 mb-6">The requested category does not exist.</p>
          <Link
            href="/docs/category"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[categorySlug] || Settings;

  return (
    <div className="min-h-screen bg-[#181818] text-gray-200 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#181818]/95 backdrop-blur-sm border-b border-[#2E2E2E]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 ${category.bgColor} ${category.borderColor} border rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${category.color}`} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {category.name}
            </h1>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
            <span>root@slowly:~/docs/categories</span>
            <span className="text-gray-600">/</span>
            <span className="text-green-400">{categorySlug}</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Category Description */}
        <div className="mb-8">
          <p className="text-gray-400 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
          {filteredEndpoints.map((endpoint) => (
            <div key={endpoint.name}>
              <div
                className="w-full bg-[#181818] border border-[#2E2E2E] p-4 flex justify-between items-center hover:bg-[#212121] transition-colors cursor-pointer rounded-lg"
                onClick={() => toggleAccordion(endpoint.name)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{endpoint.name}</h3>
                  <span className="bg-[#212121] border border-[#333] text-xs text-gray-400 px-2 py-1 rounded">
                    {Array.isArray(endpoint.method) ? endpoint.method[0] : endpoint.method?.toUpperCase() || 'GET'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    endpoint.status === 'active' 
                      ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                      : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}>
                    {endpoint.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(endpoint.endpoint);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedPath === endpoint.endpoint ? (
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

              {/* Accordion Content with Inline Playground */}
              {openAccordion === endpoint.name && (
                <div className="mt-2 bg-[#111] border border-[#2E2E2E] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-mono text-gray-400">{endpoint.endpoint}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAccordion(null);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Inline API Playground */}
                  <EndpointPlayground endpoint={endpoint} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link
            href="/docs/category"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </div>
    </div>
  );
}