// client/src/pages/Docs.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { Search, X, Copy, Play, Check, Menu, Home, ChevronDown, ChevronUp, Activity, Layers, Zap, ChevronRight, RotateCcw, Sun, Moon, User, LogOut, Settings } from 'lucide-react'

// Komponen SearchInput yang terpisah
const SearchInput = ({ value, onChange, placeholder, isDarkMode }) => {
  return (
    <div className="relative">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} pointer-events-none`} size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-12 pr-12 py-3 md:py-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm md:text-base`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}

// Komponen ParameterInput yang terpisah
const ParameterInput = ({ param, value, onChange, inputKey, isDarkMode }) => {
  const handleChange = (e) => {
    onChange(inputKey, param, e.target.value)
  }

  return (
    <div>
      <label htmlFor={inputKey} className={`block text-xs md:text-sm mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {param} <span className="text-red-400">*</span>
      </label>
      <input
        id={inputKey}
        type="text"
        placeholder={`Input ${param} for generating response.`}
        value={value}
        onChange={handleChange}
        className={`w-full px-3 md:px-4 py-2 md:py-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} border rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base`}
      />
    </div>
  )
}

// Komponen EndpointItem yang terpisah
const EndpointItem = ({ 
  endpoint, 
  category, 
  index, 
  isExpanded, 
  onToggle,
  testParams,
  onUpdateTestParam,
  onTest,
  onClearParams,
  testResult,
  isTestLoading,
  copied,
  onCopy,
  isDarkMode
}) => {
  const key = `${category}-${index}`
  const params = extractParams(endpoint.path)
  
  // Function untuk handle update parameter
  const handleUpdateParam = (endpointKey, paramName, value) => {
    onUpdateTestParam(endpointKey, paramName, value)
  }

  // Function untuk handle clear params
  const handleClearParams = () => {
    onClearParams(key)
  }

  return (
    <div className={`border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}>
      {/* Endpoint Header */}
      <div 
        className={`p-4 md:p-6 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'} transition-colors`}
        onClick={() => onToggle(category, index)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
              <span className={`px-2 md:px-3 py-1 ${isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-gray-100 text-gray-900'} text-xs md:text-sm font-semibold rounded-lg`}>
                {endpoint.method}
              </span>
              <code className="text-blue-400 text-xs md:text-sm break-all">{endpoint.path}</code>
            </div>
            <h3 className={`text-base md:text-lg font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{endpoint.name}</h3>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{endpoint.desc}</p>
          </div>
          <button className={`p-2 ${isDarkMode ? 'hover:bg-slate-950' : 'hover:bg-gray-100'} rounded-lg transition-colors flex-shrink-0`}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Endpoint Details */}
      {isExpanded && (
        <div className={`border-t ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-gray-50'}`}>
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Play size={18} className="text-blue-500" />
              <h4 className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>TRY IT OUT</h4>
            </div>

            {/* Method Tabs */}
            <div className={`flex gap-2 ${isDarkMode ? 'border-b border-slate-800' : 'border-b border-gray-200'}`}>
              <button className={`px-3 md:px-4 py-2 border-b-2 border-blue-500 font-medium text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {endpoint.method}
              </button>
            </div>

            {/* Parameters */}
            {params.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm md:text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Parameters</h5>
                  <button
                    onClick={handleClearParams}
                    className={`flex items-center gap-2 px-3 py-1 text-xs md:text-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-md transition-colors`}
                  >
                    <RotateCcw size={14} />
                    Clear All
                  </button>
                </div>
                {params.map(param => {
                  const inputKey = `${key}-${param}`
                  return (
                    <ParameterInput
                      key={inputKey}
                      param={param}
                      value={testParams[key]?.[param] || ''}
                      onChange={handleUpdateParam}
                      inputKey={key}
                      isDarkMode={isDarkMode}
                    />
                  )
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onTest(endpoint, key)}
                disabled={isTestLoading}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2 text-white"
              >
                {isTestLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Execute
                  </>
                )}
              </button>
              
              {testResult && (
                <button
                  onClick={handleClearParams}
                  className={`px-4 md:px-6 py-2 md:py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-colors text-sm md:text-base flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-lg p-3 md:p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${testResult.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{testResult.success ? 'Success' : 'Error'}</span>
                </div>
                {testResult.isImage ? (
                  <div className="mt-3">
                    <img 
                      src={testResult.imageUrl} 
                      alt="API Response" 
                      className={`max-w-full h-auto rounded-lg ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} border`}
                    />
                  </div>
                ) : (
                  <pre className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} overflow-x-auto`}>
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* cURL Command */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>CURL COMMAND</span>
              </div>
              <div className={`relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'} border rounded-lg p-3 md:p-4`}>
                <pre className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} overflow-x-auto pr-10`}>
                  {`curl -X ${endpoint.method} "${window.location.origin}${endpoint.path}"`}
                </pre>
                <button
                  onClick={() => onCopy(endpoint.path, `curl-${key}`)}
                  className={`absolute top-2 right-2 p-2 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-200'} rounded-lg transition-colors`}
                >
                  {copied === `curl-${key}` ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* HTTP Status Codes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>HTTP STATUS CODES</span>
              </div>
              <div className={`border ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} rounded-lg overflow-hidden overflow-x-auto`}>
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}>
                    <tr>
                      <th className={`text-left p-3 md:p-4 text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Code</th>
                      <th className={`text-left p-3 md:p-4 text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Description</th>
                    </tr>
                  </thead>
                  <tbody className={isDarkMode ? 'divide-y divide-slate-800' : 'divide-y divide-gray-200'}>
                    <tr>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-green-400" />
                          <span className="font-medium text-sm">200</span>
                        </div>
                      </td>
                      <td className={`p-3 md:p-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>OK - Request successful</td>
                    </tr>
                    <tr>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <X size={16} className="text-red-400" />
                          <span className="font-medium text-sm">400</span>
                        </div>
                      </td>
                      <td className={`p-3 md:p-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bad Request - Invalid parameters</td>
                    </tr>
                    <tr>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <X size={16} className="text-red-400" />
                          <span className="font-medium text-sm">405</span>
                        </div>
                      </td>
                      <td className={`p-3 md:p-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Method Not Allowed</td>
                    </tr>
                    <tr>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">⚠️</span>
                          <span className="font-medium text-sm">429</span>
                        </div>
                      </td>
                      <td className={`p-3 md:p-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Too Many Requests</td>
                    </tr>
                    <tr>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          <X size={16} className="text-red-400" />
                          <span className="font-medium text-sm">500</span>
                        </div>
                      </td>
                      <td className={`p-3 md:p-4 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Internal Server Error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Komponen CategoryView yang terpisah
const CategoryView = ({ 
  selectedCategory, 
  endpoints, 
  searchInput, 
  onSearchChange,
  expandedEndpoints,
  onToggleEndpoint,
  testParams,
  onUpdateTestParam,
  onTest,
  onClearParams,
  testResults,
  testLoading,
  copied,
  onCopy,
  isDarkMode
}) => {
  const categoryEndpoints = endpoints[selectedCategory] || []
  const filteredEndpoints = categoryEndpoints.filter(endpoint =>
    endpoint.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    endpoint.desc.toLowerCase().includes(searchInput.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchInput.toLowerCase())
  )
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className={`pb-4 ${isDarkMode ? 'border-b border-slate-800' : 'border-b border-gray-200'}`}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          {selectedCategory}
        </h1>
        <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {categoryEndpoints.length} Endpoints
        </p>
      </div>

      {/* Search */}
      <div className="w-full lg:w-2/3">
        <SearchInput
          value={searchInput}
          onChange={onSearchChange}
          placeholder="Search endpoints..."
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {filteredEndpoints.map((endpoint, index) => (
          <EndpointItem
            key={`${selectedCategory}-${index}`}
            endpoint={endpoint}
            category={selectedCategory}
            index={index}
            isExpanded={expandedEndpoints[`${selectedCategory}-${index}`]}
            onToggle={onToggleEndpoint}
            testParams={testParams}
            onUpdateTestParam={onUpdateTestParam}
            onTest={onTest}
            onClearParams={onClearParams}
            testResult={testResults[`${selectedCategory}-${index}`]}
            isTestLoading={testLoading[`${selectedCategory}-${index}`]}
            copied={copied}
            onCopy={onCopy}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  )
}

// Fungsi helper yang dipindahkan ke luar komponen
const extractParams = (path) => {
  const matches = path.match(/[?&]([^=]+)=/g)
  if (!matches) return []
  return matches.map(m => m.replace(/[?&]/g, '').replace('=', ''))
}

// Profile Dropdown Component
const ProfileDropdown = ({ user, isDarkMode, onLogout, navigate }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <ChevronDown size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border z-20`}>
            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/profile')
                  setIsOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors`}
              >
                <Settings size={16} />
                Profile
              </button>
              <button
                onClick={() => {
                  onLogout()
                  setIsOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'} transition-colors`}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const Docs = ({ metadata }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [endpoints, setEndpoints] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [expandedEndpoints, setExpandedEndpoints] = useState({})
  const [testParams, setTestParams] = useState({})
  const [testResults, setTestResults] = useState({})
  const [testLoading, setTestLoading] = useState({})
  const [copied, setCopied] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalRequests, setTotalRequests] = useState('0')
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Route management
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    // Parse current route
    const path = window.location.pathname
    const categoryMatch = path.match(/\/category\/([^/]+)/)
    if (categoryMatch) {
      setSelectedCategory(decodeURIComponent(categoryMatch[1]))
    } else {
      setSelectedCategory(null)
    }
    setCurrentPath(path)
  }, [])

  useEffect(() => {
    // Fetch endpoints
    fetch('/api/endpoints')
      .then(response => response.json())
      .then(data => {
        if (data.status && data.result) {
          setEndpoints(data.result)
        }
      })
      .catch(error => {
        console.error('Failed to fetch endpoints:', error)
      })

    // Fetch API status for total requests
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        if (data.status && data.result) {
          setTotalRequests(data.result.reqTotal || '0')
        }
      })
      .catch(error => {
        console.error('Failed to fetch status:', error)
      })
  }, [])

  const totalFeatures = Object.values(endpoints).reduce((sum, items) => sum + items.length, 0)
  const totalCategories = Object.keys(endpoints).length

  const navigateTo = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    
    const categoryMatch = path.match(/\/category\/([^/]+)/)
    if (categoryMatch) {
      setSelectedCategory(decodeURIComponent(categoryMatch[1]))
    } else {
      setSelectedCategory(null)
    }
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(window.location.origin + text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }, [])

  const toggleEndpoint = useCallback((categoryIndex, endpointIndex) => {
    const key = `${categoryIndex}-${endpointIndex}`
    setExpandedEndpoints(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const handleTest = useCallback(async (endpoint, key) => {
    setTestLoading(prev => ({ ...prev, [key]: true }))
    setTestResults(prev => ({ ...prev, [key]: null }))

    try {
      let url = endpoint.path
      const params = testParams[key] || {}
      
      Object.entries(params).forEach(([paramKey, value]) => {
        url = url.replace(`${paramKey}=`, `${paramKey}=${encodeURIComponent(value)}`)
      })

      const response = await fetch(url)
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.startsWith('image/')) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setTestResults(prev => ({ 
          ...prev, 
          [key]: { success: response.ok, data: null, imageUrl, isImage: true } 
        }))
      } else {
        const data = await response.json()
        setTestResults(prev => ({ 
          ...prev, 
          [key]: { success: response.ok, data, isImage: false } 
        }))
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [key]: { 
          success: false, 
          data: { error: error.message },
          isImage: false
        } 
      }))
    } finally {
      setTestLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [testParams])

  // Function untuk clear params dan results
  const clearParams = useCallback((key) => {
    setTestParams(prev => {
      const newParams = { ...prev }
      delete newParams[key]
      return newParams
    })
    
    setTestResults(prev => {
      const newResults = { ...prev }
      delete newResults[key]
      return newResults
    })
  }, [])

  const updateTestParam = useCallback((endpointKey, paramName, value) => {
    setTestParams(prev => ({
      ...prev,
      [endpointKey]: {
        ...(prev[endpointKey] || {}),
        [paramName]: value
      }
    }))
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const DashboardView = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className={`pb-4 ${isDarkMode ? 'border-b border-slate-800' : 'border-b border-gray-200'}`}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          {metadata.apititle || 'API'}
        </h1>
        <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Next-generation API with random features for developers.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 hover:border-blue-500/50 transition-colors shadow-lg hover:shadow-xl`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
              <Activity className="text-blue-400" size={20} />
            </div>
            <span className="px-2 md:px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <p className={`text-gray-400 text-xs md:text-sm mb-1 md:mb-2`}>API Status</p>
          <p className={`text-lg md:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Live</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 hover:border-blue-500/50 transition-colors shadow-lg hover:shadow-xl`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
              <Layers className="text-blue-400" size={20} />
            </div>
          </div>
          <p className={`text-gray-400 text-xs md:text-sm mb-1 md:mb-2`}>Categories</p>
          <p className={`text-lg md:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{totalCategories}</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 hover:border-blue-500/50 transition-colors shadow-lg hover:shadow-xl`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
              <Zap className="text-purple-400" size={20} />
            </div>
          </div>
          <p className={`text-gray-400 text-xs md:text-sm mb-1 md:mb-2`}>Requests</p>
          <p className={`text-lg md:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{totalRequests}</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 hover:border-blue-500/50 transition-colors shadow-lg hover:shadow-xl`}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-pink-500/20 rounded-lg">
              <Zap className="text-pink-400" size={20} />
            </div>
          </div>
          <p className={`text-gray-400 text-xs md:text-sm mb-1 md:mb-2`}>Features</p>
          <p className={`text-lg md:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{totalFeatures}</p>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-4 md:p-6 shadow-lg`}>
        <h2 className={`text-xl md:text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Getting Started</h2>
        <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
          Welcome to API documentation. Select a category from the sidebar to explore available endpoints.
        </p>
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className={`font-medium mb-1 text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Browse Categories</p>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose from {totalCategories} available categories in the sidebar</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className={`font-medium mb-1 text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Select an Endpoint</p>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click on any endpoint to view details and parameters</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <p className={`font-medium mb-1 text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Try It Out</p>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Test endpoints directly in the browser with the interactive tool</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'} flex transition-colors duration-300`}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-r transition-transform duration-300 flex flex-col
      `}>
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 pt-20 lg:pt-4">
          <div className="space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => navigateTo('/')}
              className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base ${
                !selectedCategory ? 'bg-blue-500/20 text-blue-400' : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')
              }`}
            >
              <Home size={18} />
              <span className="font-medium">Dashboard</span>
            </button>

            {/* Categories Section */}
            <div className="pt-4 pb-2 px-2">
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} uppercase font-semibold`}>Categories</p>
            </div>
            
            <div className="space-y-2">
              {Object.entries(endpoints).map(([category, items]) => (
                <button
                  key={category}
                  onClick={() => navigateTo(`/category/${encodeURIComponent(category)}`)}
                  className={`w-full group rounded-lg transition-all ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50' 
                      : (isDarkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' : 'bg-gray-100/50 border-gray-200/50 hover:border-gray-300')
                  }`}
                >
                  <div className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium capitalize text-sm md:text-base ${
                        selectedCategory === category ? 'text-blue-400' : (isDarkMode ? 'text-gray-200' : 'text-gray-700')
                      }`}>
                        {category}
                      </span>
                      <ChevronRight size={16} className={`${
                        selectedCategory === category ? 'text-blue-400' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                      }`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{items.length} endpoints</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        selectedCategory === category 
                          ? 'bg-blue-500/30 text-blue-300' 
                          : (isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                      }`}>
                        {items.length}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Mobile Menu Button - Fixed to top */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden fixed top-4 left-4 z-50 p-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} transition-colors shadow-lg`}
        >
          <Menu size={20} />
        </button>

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

        {/* Profile Dropdown - Fixed to top right */}
        <div className="fixed top-4 right-16 z-50">
          <ProfileDropdown 
            user={user} 
            isDarkMode={isDarkMode} 
            onLogout={handleLogout} 
            navigate={navigate} 
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-7xl pt-16 lg:pt-6 lg:ml-0">
          {selectedCategory ? (
            <CategoryView
              selectedCategory={selectedCategory}
              endpoints={endpoints}
              searchInput={searchInput}
              onSearchChange={handleSearchChange}
              expandedEndpoints={expandedEndpoints}
              onToggleEndpoint={toggleEndpoint}
              testParams={testParams}
              onUpdateTestParam={updateTestParam}
              onTest={handleTest}
              onClearParams={clearParams}
              testResults={testResults}
              testLoading={testLoading}
              copied={copied}
              onCopy={handleCopy}
              isDarkMode={isDarkMode}
            />
          ) : (
            <DashboardView />
          )}
        </div>
      </div>
    </div>
  )
}

export default Docs