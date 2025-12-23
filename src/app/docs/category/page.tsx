'use client';

import Link from 'next/link';
import { ArrowRight, Folder, Bot, Download, Dices, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await fetch('/endpoints.json');
        const data: EndpointsData = await response.json();
        
        // Convert to array and count endpoints
        const categoryArray = Object.entries(data).map(([slug, categoryData]) => {
          const endpoints = Object.entries(categoryData)
            .filter(([key]) => !['name', 'description', 'icon', 'color', 'bgColor', 'borderColor'].includes(key))
            .map(([_, endpoint]) => endpoint as Endpoint);
          
          return {
            slug,
            ...categoryData,
            endpointCount: endpoints.length
          };
        });
        
        setCategories(categoryArray);
      } catch (error) {
        console.error('Failed to load endpoints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-gray-200 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading categories...</p>
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
              <Folder className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              API Categories
            </h1>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
            <span>root@slowly:~/docs</span>
            <span className="text-gray-600">/</span>
            <span className="text-green-400">categories</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Description */}
        <div className="mb-12">
          <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
            Browse our API endpoints organized by category. Each category contains related endpoints 
            with detailed documentation and examples.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = iconMap[category.slug] || Folder;
            return (
              <Link
                key={category.slug}
                href={`/docs/category/${category.slug}`}
                className="group block"
              >
                <div className={`h-full bg-[#212121] border border-[#2E2E2E] rounded-xl p-6 hover:bg-[#262626] hover:border-[#383838] transition-all duration-200 cursor-pointer`}>
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${category.bgColor} ${category.borderColor} border rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {category.endpointCount} endpoint{category.endpointCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Call to Action */}
                  <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                    <span>Browse endpoints</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {categories.reduce((total, cat) => total + cat.endpointCount, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Need help getting started?</h3>
          <p className="text-gray-400 mb-6">
            Check out our main documentation for authentication, examples, and best practices.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Documentation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}