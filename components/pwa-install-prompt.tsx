'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { usePWA, useNetworkStatus } from '@/hooks/use-pwa';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isStandalone, promptInstall, dismissPrompt } = usePWA();
  const { isOnline, connectionType } = useNetworkStatus();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if installable and not already installed
    if (isInstallable && !isInstalled && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isStandalone]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await promptInstall();
      setShowPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setShowPrompt(false);
  };

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install App</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install E-Manage Al-Ishlah for a better experience
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Ready
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Monitor className="h-3 w-3 mr-1" />
                Desktop App
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline Mode
              </Badge>
            </div>
            
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Works offline</li>
              <li>• Faster loading</li>
              <li>• Push notifications</li>
              <li>• Home screen access</li>
            </ul>

            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? 'Installing...' : 'Install Now'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-3"
              >
                Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NetworkStatusIndicator() {
  const { isOnline, connectionType } = useNetworkStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
    } else {
      // Hide alert after coming back online
      const timer = setTimeout(() => {
        setShowOfflineAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineAlert && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className={isOnline ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={isOnline ? 'text-green-800' : 'text-orange-800'}>
            {isOnline ? (
              <>
                Back online! Connection: {connectionType}
              </>
            ) : (
              'You are offline. Some features may be limited.'
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

export function PWAStatus() {
  const { isInstalled, isStandalone } = usePWA();
  const { isOnline } = useNetworkStatus();

  if (!isInstalled && !isStandalone) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Badge variant="outline" className="text-xs">
        <Smartphone className="h-3 w-3 mr-1" />
        PWA Mode
      </Badge>
      {!isOnline && (
        <Badge variant="outline" className="text-xs text-orange-600">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
    </div>
  );
}
