import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Sun, Moon } from 'lucide-react'
import { useState } from 'react'

const NotFound = () => {
  const [isDarkMode, setIsDarkMode] = useState(false) // Set light mode as default

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
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

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            {/* 404 Number */}
            <div className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-6 md:mb-8 animate-pulse">
              404
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Page Not Found</h1>
            
            {/* Description */}
            <p className={`text-base md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 md:mb-10 max-w-2xl mx-auto`}>
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link 
                to="/" 
                className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white inline-flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                Go Home
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className={`px-6 md:px-8 py-3 md:py-4 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg font-medium transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} inline-flex items-center justify-center gap-2 text-sm md:text-base`}
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                Go Back
              </button>
            </div>

            {/* Decorative Element */}
            <div className={`mt-12 md:mt-16 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
              <svg className="w-48 h-48 md:w-64 md:h-64 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
            </div>

            {/* Additional Content */}
            <div className={`mt-12 p-6 md:p-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'} border rounded-xl max-w-2xl mx-auto`}>
              <h2 className={`text-xl md:text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>What can you do now?</h2>
              <ul className={`space-y-2 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Return to the homepage and navigate from there</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Use the search function to find what you're looking for</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Contact support if you believe this is an error</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound