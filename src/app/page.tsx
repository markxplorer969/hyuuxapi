'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Properly escaped braces for JSX
  const openBrace = '{';
  const closeBrace = '}';

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Embedded Header */}
      <header className="flex justify-between items-center pt-6 px-6 max-w-7xl mx-auto">
        <h1 className="font-bold text-white text-xl">Slowly API</h1>
        <button 
          onClick={() => router.push('/login')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Badge */}
        <div className="bg-[#212121] border border-[#2E2E2E] text-gray-400 rounded-full px-4 py-1 text-sm mb-6 inline-block">
          v2.0 Now Available
        </div>
        
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
          The API for<br />
          <span className="font-bold">Builders & Creators</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Stop building from scratch. Access premium-grade REST endpoints with 99.9% uptime.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/docs')}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/docs')}
            className="bg-[#212121] text-white border border-[#2E2E2E] px-8 py-3 rounded-lg font-medium hover:bg-[#262626] hover:border-[#383838] transition-all"
          >
            View Documentation
          </button>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Code Terminal (Span 2) */}
          <div className="md:col-span-2 bg-[#212121] border border-[#2E2E2E] rounded-xl p-6 hover:bg-[#262626] hover:border-[#383838] transition-all">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-gray-400 text-sm font-mono">api-test.js</span>
            </div>
            
            {/* Code Content - PROPERLY ESCAPED */}
            <div className="bg-[#181818] rounded-lg p-4 font-mono text-sm text-gray-300">
              <div className="text-gray-500 mb-2">// Test API endpoint</div>
              <div className="mb-1">
                <span className="text-purple-400">const</span> response = <span className="text-yellow-400">await</span> fetch(
              </div>
              <div className="mb-1 ml-4">
                <span className="text-green-400">'https://api.hyux.dev/ai/generate'</span>,
              </div>
              <div className="mb-1">{openBrace}</div>
              <div className="mb-1 ml-4">
                <span className="text-blue-400">method</span>: <span className="text-green-400">'POST'</span>,
              </div>
              <div className="mb-1 ml-4">
                <span className="text-blue-400">headers</span>: {openBrace}
              </div>
              <div className="mb-1 ml-8">
                <span className="text-green-400">'Authorization'</span>: <span className="text-green-400">'Bearer YOUR_API_KEY'</span>,
              </div>
              <div className="mb-1 ml-8">
                <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span>
              </div>
              <div className="mb-1">{closeBrace}</div>
              <div className="mb-3">{closeBrace});</div>
              <div className="mb-1">
                <span className="text-purple-400">const</span> data = <span className="text-yellow-400">await</span> response.json();
              </div>
              <div>
                <span className="text-gray-400">console</span>.log(data);
              </div>
            </div>
          </div>

          {/* Card 2: Speed (Span 1) */}
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl p-6 hover:bg-[#262626] hover:border-[#383838] transition-all">
            <div className="flex flex-col items-center text-center">
              <i className="fa-solid fa-bolt text-yellow-500 text-2xl mb-4"></i>
              <h3 className="text-white font-medium text-lg mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Optimized for low latency.</p>
            </div>
          </div>

          {/* Card 3: Security (Span 1) */}
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-xl p-6 hover:bg-[#262626] hover:border-[#383838] transition-all">
            <div className="flex flex-col items-center text-center">
              <i className="fa-solid fa-shield-halved text-green-500 text-2xl mb-4"></i>
              <h3 className="text-white font-medium text-lg mb-2">Secure Access</h3>
              <p className="text-gray-400 text-sm">Role-based API Keys.</p>
            </div>
          </div>

          {/* Card 4: Free Tier (Span 2) */}
          <div className="md:col-span-2 bg-[#212121] border border-[#2E2E2E] rounded-xl p-6 hover:bg-[#262626] hover:border-[#383838] transition-all">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-gift text-pink-500 text-2xl mr-4"></i>
              </div>
              <div>
                <h3 className="text-white font-medium text-xl mb-2">Start for Free</h3>
                <p className="text-gray-300">No credit card required.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}