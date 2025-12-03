'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  EyeOff,
  Zap, 
  Network, 
  Clock, 
  Calendar, 
  Battery as BatteryIcon,
  BatteryCharging,
  Copy,
  Users,
  Server,
  Cpu,
  TrendingUp,
  Activity,
  CheckCircle,
  RefreshCw,
  Key,
  Shield
} from 'lucide-react';

// Extend Navigator interface for Battery API
interface Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (type: string, listener: (this: BatteryManager, ev: Event) => any) => void;
  removeEventListener: (type: string, listener: (this: BatteryManager, ev: Event) => any) => void;
}

interface Contributor {
  name: string;
  role: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userIP, setUserIP] = useState('Loading...');
  const [battery, setBattery] = useState<{
    level: number;
    charging: boolean;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  // Mock API Key (in real app, this would come from backend)
  const apiKey = 'sk-slowly-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  const contributors: Contributor[] = [
    { name: 'Sarah Chen', role: 'Frontend Developer' },
    { name: 'Marcus Rodriguez', role: 'Backend Engineer' },
    { name: 'Emily Johnson', role: 'UI/UX Designer' },
    { name: 'David Kim', role: 'DevOps Engineer' },
    { name: 'Lisa Anderson', role: 'Product Manager' }
  ];

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clock and Date update
  useEffect(() => {
    if (!mounted) return;

    const updateDateTime = () => {
      const now = new Date();
      
      // Update time (HH:MM:SS)
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // Update date (Day, DD Mon YYYY)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${dayName}, ${day} ${month} ${year}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  // Fetch user IP
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        console.error('Failed to fetch IP:', error);
        setUserIP('192.168.1.1'); // Fallback IP
      }
    };

    if (mounted) {
      fetchIP();
    }
  }, [mounted]);

  // Battery API
  useEffect(() => {
    if (!mounted) return;

    const getBatteryInfo = async () => {
      try {
        const nav = navigator as Navigator;
        if (nav.getBattery) {
          const battery = await nav.getBattery();
          
          const updateBattery = () => {
            setBattery({
              level: Math.round(battery.level * 100),
              charging: battery.charging
            });
          };

          updateBattery();
          
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);

          return () => {
            battery.removeEventListener('levelchange', updateBattery);
            battery.removeEventListener('chargingchange', updateBattery);
          };
        }
      } catch (error) {
        console.error('Battery API not available:', error);
        setBattery({ level: 85, charging: false }); // Fallback
      }
    };

    const cleanup = getBatteryInfo();
    return cleanup;
  }, [mounted]);

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const maskedApiKey = `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background pt-20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time system monitoring and API management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {/* Page Views */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">56,415</span>
                <span className="text-sm text-muted-foreground">views</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Total this month</p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today Requests */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">Today Requests</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{animatedStats.apiCalls}</span>
                <span className="text-sm text-muted-foreground">calls</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">API calls today</p>
                <div className="flex items-center gap-1 text-blue-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+8.2%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rate limit</span>
                  <span className="font-medium text-green-600">1,000/day</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your IP */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Network className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">IP Address</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600 font-medium">Connected</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-green-600 dark:text-green-400">{userIP}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Current IP address</p>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">Live</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400">{currentTime}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Real-time clock</p>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">Sync</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentDate}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Current date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-600">Updated</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battery */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  {battery?.charging ? (
                    <BatteryCharging className="h-4 w-4 text-white" />
                  ) : (
                    <BatteryIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                <CardTitle className="text-sm font-medium">Battery</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${battery?.charging ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={`text-xs font-medium ${battery?.charging ? 'text-green-600' : 'text-gray-600'}`}>
                  {battery?.charging ? 'Charging' : 'Discharging'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${battery?.level && battery.level > 50 ? 'text-green-600 dark:text-green-400' : battery?.level && battery.level > 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {battery ? `${battery.level}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Power level</p>
                <div className="flex items-center gap-1">
                  <BatteryIcon className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Monitor</span>
                </div>
              </div>
              {battery && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        battery.level > 50 ? 'bg-green-500' : 
                        battery.level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${battery.level}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Key Section */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Cek Apikey</CardTitle>
                  <p className="text-sm text-muted-foreground">Kelola API key Anda</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">API Key</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="h-8 w-8 p-0"
                  >
                    {apiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyApiKey}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input 
                  type={apiKeyVisible ? "text" : "password"}
                  value={maskedApiKey} 
                  readOnly 
                  className="font-mono text-sm pr-20 bg-muted/30 border-border/50"
                  placeholder="API Key akan muncul di sini"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">Status</span>
                </div>
                <p className="text-sm font-semibold text-green-600">Aktif</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium">Usage Today</span>
                </div>
                <p className="text-sm font-semibold">{animatedStats.apiCalls}/1,000</p>
              </div>
            </div>

            {copiedKey && (
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">API Key berhasil disalin!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contributors Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Tim Pengembang</CardTitle>
                  <p className="text-sm text-muted-foreground">Profesional berpengalaman</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">5 Aktif</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.map((contributor, index) => (
                <div key={index} className="group flex items-center space-x-3 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {contributor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{contributor.name}</p>
                    <p className="text-sm text-muted-foreground">{contributor.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* System Info */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-4">Informasi Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Server className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Next.js 15.3.5</p>
                    <p className="text-xs text-muted-foreground">Framework</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Cpu className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">React 19</p>
                    <p className="text-xs text-muted-foreground">Library</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">5 Kontributor</p>
                    <p className="text-xs text-muted-foreground">Tim Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}