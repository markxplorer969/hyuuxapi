// client/src/context/Auth.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Generate API key function
const generateApiKey = () => {
  return `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  // Create user profile in Firestore
  const createProfile = async (user) => {
    try {
      console.log('Creating profile for user:', user.uid)
      
      const apiKey = generateApiKey()
      
      const profileData = {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        avatar_url: user.photoURL || null,
        api_key: apiKey,
        api_limit: 20,
        usage: 0,
        is_custom_api_key: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      console.log('Profile data to create:', profileData)
      
      await setDoc(doc(db, 'users', user.uid), profileData)
      setProfile(profileData)
      console.log('Profile created successfully')
      return profileData
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  // Get user profile from Firestore
  const getProfile = async (uid) => {
    try {
      console.log('Getting profile for user:', uid)
      
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const profileData = docSnap.data()
        console.log('Profile found:', profileData)
        setProfile(profileData)
        return profileData
      } else {
        console.log('Profile not found, creating new one')
        // If profile doesn't exist, create it
        return await createProfile({ uid, email: auth.currentUser?.email })
      }
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  }

  // Update user profile in Firestore
  const updateUserProfile = async (uid, data) => {
    try {
      console.log('Updating profile for user:', uid, 'with data:', data)
      
      const updateData = {
        ...data,
        updated_at: serverTimestamp()
      }
      
      await updateDoc(doc(db, 'users', uid), updateData)
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...data
      }))
      
      console.log('Profile updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Check if email already exists
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  // Register with email and password
  const register = async (name, email, password) => {
    try {
      console.log('Starting registration for:', email)
      setLoading(true)
      
      // First create the user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('User created in Auth:', result.user.uid)
      
      // Update display name
      await updateFirebaseProfile(result.user, { displayName: name })
      console.log('Display name updated')
      
      // Create profile in Firestore
      await createProfile({ ...result.user, displayName: name })
      console.log('Profile created in Firestore')
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      let errorMessage = error.message
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      console.log('Starting login for:', email)
      setLoading(true)
      
      await signInWithEmailAndPassword(auth, email, password)
      console.log('Login successful')
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = error.message
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      console.log('Logging out')
      await signOut(auth)
      setUser(null)
      setProfile(null)
      console.log('Logout successful')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.uid : 'null')
      setUser(user)
      
      if (user) {
        await getProfile(user.uid)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
      setInitializing(false)
    })

    return () => {
      console.log('Cleaning up auth state listener')
      unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    loading,
    initializing,
    register,
    login,
    logout,
    updateProfile: updateUserProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}