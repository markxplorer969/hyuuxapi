'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  Zap, 
  Network, 
  Clock, 
  Calendar, 
  Battery as BatteryIcon,
  BatteryCharging,
  Copy,
  Users,
  Server,
  Cpu
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
      <div className="min-h-screen bg-background p-4">
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time system monitoring and API management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {/* Page Views */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56,415</div>
              <p className="text-xs text-muted-foreground">Total views this month</p>
            </CardContent>
          </Card>

          {/* Today Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">API calls today</p>
            </CardContent>
          </Card>

          {/* Your IP */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your IP</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userIP}</div>
              <p className="text-xs text-muted-foreground">Current IP address</p>
            </CardContent>
          </Card>

          {/* Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{currentTime}</div>
              <p className="text-xs text-muted-foreground">Real-time clock</p>
            </CardContent>
          </Card>

          {/* Date */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentDate}</div>
              <p className="text-xs text-muted-foreground">Current date</p>
            </CardContent>
          </Card>

          {/* Battery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery</CardTitle>
              {battery?.charging ? (
                <BatteryCharging className="h-4 w-4 text-green-500" />
              ) : (
                <BatteryIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {battery ? `${battery.level}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {battery ? (battery.charging ? 'Charging' : 'Discharging') : 'Battery API unavailable'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Key Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Cek Apikey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input 
                value={maskedApiKey} 
                readOnly 
                className="flex-1 font-mono"
                placeholder="API Key will appear here"
              />
              <Button 
                onClick={copyApiKey}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            {copiedKey && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                API key copied to clipboard!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contributors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold mb-4">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {contributor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{contributor.name}</p>
                    <p className="text-sm text-muted-foreground">{contributor.role}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* System Info */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">System Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Next.js 15.3.5</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">React 19</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">5 Contributors</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}