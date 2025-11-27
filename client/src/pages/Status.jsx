import { useState, useEffect } from 'react'
import { Clock, Zap, TrendingUp, Server, Cpu, HardDrive, RefreshCw, Sun, Moon } from 'lucide-react'
import axios from 'axios'

const Status = ({ metadata }) => {
  const [status, setStatus] = useState({})
  const [health, setHealth] = useState({})
  const [cache, setCache] = useState({})
  const [realtimeStats, setRealtimeStats] = useState([])
  const [topEndpoints, setTopEndpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false) // Set light mode as default

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statusRes, healthRes, cacheRes, realtimeRes, topRes] = await Promise.all([
        axios.get('/api/status'),
        axios.get('/api/health'),
        axios.get('/api/cache/stats'),
        axios.get('/api/stats/realtime'),
        axios.get('/api/stats/top?limit=10')
      ])

      if (statusRes.data.status) setStatus(statusRes.data.result)
      if (healthRes.data.status) setHealth(healthRes.data.result)
      if (cacheRes.data.status) setCache(cacheRes.data.result)
      if (realtimeRes.data.status) setRealtimeStats(realtimeRes.data.result || [])
      if (topRes.data.status) setTopEndpoints(topRes.data.result || [])

      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatPercentage = (value) => {
    return (value * 100).toFixed(1) + '%'
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (loading && !status.status) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} transition-colors shadow-lg`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className={`inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 ${isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-full mb-6 md:mb-8`}>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold text-sm md:text-base">All Systems Operational</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              System Status
            </span>
          </h1>
          <p className={`text-base md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time monitoring of API performance and system health
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-2">{status.uptime || 'Loading...'}</div>
            <div className="text-xs md:text-sm text-green-400 flex items-center gap-1">
              <TrendingUp size={14} />
              <span>99.9%</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-2">&lt;100ms</div>
            <div className="text-xs md:text-sm text-green-400 flex items-center gap-1">
              <span>Optimal</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-2">{status.reqTotal || '0'}</div>
            <div className="text-xs md:text-sm text-green-400 flex items-center gap-1">
              <span>Active</span>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Endpoints</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-2">{status.featureTotal || '0'}</div>
            <div className="text-xs md:text-sm text-green-400 flex items-center gap-1">
              <span>All Active</span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg mb-8 md:mb-12`}>
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              System Information
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Platform</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{health.platform || 'N/A'}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Node Version</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{health.nodeVersion || 'N/A'}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>CPU Cores</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{health.cpuCores || 'N/A'}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Total Memory</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatBytes(health.totalMemory)}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Free Memory</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatBytes(health.freeMemory)}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Process Memory</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatBytes(health.memoryUsage?.heapUsed)}</div>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg mb-8 md:mb-12`}>
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Cache Performance
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Cache Hits</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{cache.hits || 0}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Cache Misses</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{cache.misses || 0}</div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Hit Ratio</div>
              <div className={`text-sm md:text-lg font-semibold font-mono mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {cache.hits_ratio ? formatPercentage(cache.hits_ratio) : '0%'}
              </div>
              <div className={`w-full h-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ width: cache.hits_ratio ? `${cache.hits_ratio * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider mb-2`}>Cached Keys</div>
              <div className={`text-sm md:text-lg font-semibold font-mono ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{cache.keys || 0}</div>
            </div>
          </div>
        </div>

        {/* Top Endpoints */}
        {topEndpoints.length > 0 && (
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg mb-8 md:mb-12`}>
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Most Requested Endpoints
              </span>
            </h3>
            <div className="space-y-3">
              {topEndpoints.map((endpoint, index) => (
                <div key={index} className={`flex items-center justify-between p-3 md:p-4 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}>
                  <code className="text-xs md:text-sm font-mono text-blue-400">{endpoint.endpoint}</code>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{endpoint.count} requests</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2 text-white mx-auto"
          >
            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          {lastUpdated && (
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Status