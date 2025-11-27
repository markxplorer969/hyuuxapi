// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/Auth'
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { 
  User, 
  Key, 
  Lock, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Save,
  Shield,
  Mail,
  User as UserIcon
} from 'lucide-react'

const Profile = () => {
  const { user, profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  })
  
  // API key form state
  const [apiKeyForm, setApiKeyForm] = useState({
    apiKey: '',
    isCustom: false
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  })

  // Initialize form data
  useEffect(() => {
    if (user && profile) {
      setProfileForm({
        name: profile.name || user.displayName || '',
        email: profile.email || user.email || ''
      })
      
      setApiKeyForm({
        apiKey: profile.api_key || '',
        isCustom: profile.is_custom_api_key || false
      })
    }
  }, [user, profile])

  // Reset messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  // Generate new API key
  const generateApiKey = () => {
    return `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  }

  // Handle profile update (moved to third tab)
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    
    try {
      // Update display name in Firebase Auth
      await updateFirebaseProfile(auth.currentUser, {
        displayName: profileForm.name
      })
      
      // Update email if changed
      if (profileForm.email !== user.email) {
        await updateEmail(auth.currentUser, profileForm.email)
      }
      
      // Update profile in Firestore
      await updateProfile(user.uid, {
        name: profileForm.name,
        email: profileForm.email
      })
      
      setSuccess('Profile updated successfully!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle API key update
  const handleApiKeyUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    
    try {
      const newApiKey = apiKeyForm.isCustom ? apiKeyForm.apiKey : generateApiKey()
      
      await updateProfile(user.uid, {
        api_key: newApiKey,
        is_custom_api_key: apiKeyForm.isCustom
      })
      
      setSuccess('API key updated successfully!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      )
      
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword)
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      })
      
      setSuccess('Password updated successfully!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Handle form input changes
  const handleInputChange = (form, field, value) => {
    if (form === 'profile') {
      setProfileForm(prev => ({ ...prev, [field]: value }))
    } else if (form === 'apiKey') {
      setApiKeyForm(prev => ({ ...prev, [field]: value }))
    } else if (form === 'password') {
      setPasswordForm(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Profile Settings</h1>
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {profile?.name || user?.displayName || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center mt-1">
              <Shield className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                API Limit: {profile?.api_limit || 20} / Usage: {profile?.usage || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <User className="inline-block w-5 h-5 mr-2" />
            User Data
          </button>
          <button
            onClick={() => setActiveTab('apiKey')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'apiKey'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Key className="inline-block w-5 h-5 mr-2" />
            API Key
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Lock className="inline-block w-5 h-5 mr-2" />
            Account Settings
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}
          
          {/* Profile Tab - Display Only */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900 dark:text-gray-100">
                    {profile?.name || user?.displayName || 'Not set'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900 dark:text-gray-100">
                    {profile?.email || user?.email || 'Not set'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To edit your profile information, go to the Account Settings tab.
                </p>
              </div>
            </div>
          )}
          
          {/* API Key Tab */}
          {activeTab === 'apiKey' && (
            <form onSubmit={handleApiKeyUpdate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="apiKey"
                      value={apiKeyForm.apiKey}
                      onChange={(e) => handleInputChange('apiKey', 'apiKey', e.target.value)}
                      disabled={!apiKeyForm.isCustom}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${
                        !apiKeyForm.isCustom ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your API key"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isCustom"
                    type="checkbox"
                    checked={apiKeyForm.isCustom}
                    onChange={(e) => handleInputChange('apiKey', 'isCustom', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isCustom" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Use custom API key (Premium plan)
                  </label>
                </div>
                
                {!apiKeyForm.isCustom && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Click "Generate New Key" to create a new API key. This will replace your current key.
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {apiKeyForm.isCustom ? 'Save Custom Key' : 'Generate New Key'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Password Tab - Now includes profile editing */}
          {activeTab === 'password' && (
            <div>
              {/* Profile Edit Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Profile</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={profileForm.email}
                        onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Password Reset Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handleInputChange('password', 'currentPassword', e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('showCurrentPassword')}
                      >
                        {passwordForm.showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={passwordForm.showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => handleInputChange('password', 'newPassword', e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('showNewPassword')}
                      >
                        {passwordForm.showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handleInputChange('password', 'confirmPassword', e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('showConfirmPassword')}
                      >
                        {passwordForm.showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile