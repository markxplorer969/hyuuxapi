// client/src/components/Navbar.jsx (or wherever your navigation is)
import { useAuth } from '../context/Auth'
import { User } from 'lucide-react'

const Navbar = () => {
  const { user } = useAuth()

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo or brand */}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <a href="/profile" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </a>
            ) : (
              <a href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar