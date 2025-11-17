/**
 * Service Worker Manager for ArcheForge Landing Page
 * Handles service worker registration, communication, and lifecycle management
 */

import { logger } from './logger';

export interface ServiceWorkerConfig {
  enableCaching: boolean;
  enableOfflineSupport: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  cacheVersion: string;
  updateInterval: number; // minutes
}

export interface CacheInfo {
  name: string;
  entries: number;
  maxEntries: number;
  maxAge: number;
  urls: string[];
}

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  activated: boolean;
  controller: boolean;
  version: string | null;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private messageChannel: MessageChannel | null = null;
  private updateTimer?: ReturnType<typeof setTimeout>;
  private isOnline = navigator.onLine;

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkChange?.(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkChange?.(false);
    });
  }

  public async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return false;
    }

    try {
      logger.serviceWorker('Registering...');
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      logger.serviceWorker('Registered successfully');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start update checking
      this.startUpdateChecking();
      
      return true;
    } catch (error) {
      logger.error('Service Worker: Registration failed:', error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    // Update found
    this.registration.addEventListener('updatefound', () => {
      logger.serviceWorker('Update found');
      const newWorker = this.registration?.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New worker available, show update notification
            this.showUpdateNotification();
          }
        });
      }
    });

    // Controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.serviceWorker('Controller changed');
      window.location.reload();
    });

    // Message handling
    navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_INFO':
        this.onCacheInfo?.(data);
        break;
        
      case 'CACHE_CLEARED':
        this.onCacheCleared?.(data);
        break;
        
      case 'VIDEO_PRELOADED':
        this.onVideoPreloaded?.(data);
        break;
        
      default:
        logger.serviceWorker('Unknown message type:', type, data);
    }
  }

  private startUpdateChecking(): void {
    if (this.config.updateInterval > 0) {
      this.updateTimer = setInterval(() => {
        this.checkForUpdates();
      }, this.config.updateInterval * 60 * 1000);
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      logger.warn('Service Worker: Update check failed:', error);
    }
  }

  private showUpdateNotification(): void {
    // Create custom notification or use browser notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <p>A new version of ArcheForge is available</p>
        <button id="update-btn">Update Now</button>
        <button id="dismiss-btn">Later</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Handle button clicks
    document.getElementById('update-btn')?.addEventListener('click', () => {
      this.skipWaiting();
      document.body.removeChild(notification);
    });
    
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      document.body.removeChild(notification);
    });
  }

  // Public API Methods
  public async getCacheInfo(): Promise<{ [cacheName: string]: CacheInfo }> {
    return this.sendMessage('GET_CACHE_INFO');
  }

  public async clearCache(cacheType: string): Promise<void> {
    return this.sendMessage('CLEAR_CACHE', { cacheType });
  }

  public async preloadVideo(url: string): Promise<boolean> {
    const result = await this.sendMessage('PRELOAD_VIDEO', { url });
    return result?.success || false;
  }

  public skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private async sendMessage(type: string, data?: any): Promise<any> {
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.data);
      };
      
      controller.postMessage(
        { type, data },
        [channel.port2]
      );
    });
  }

  public getStatus(): ServiceWorkerStatus {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      activated: !!navigator.serviceWorker.controller,
      controller: !!navigator.serviceWorker.controller,
      version: this.config.cacheVersion
    };
  }

  public isServiceWorkerOnline(): boolean {
    return this.isOnline;
  }

  // Event callbacks
  public onCacheInfo?: (info: { [cacheName: string]: CacheInfo }) => void;
  public onCacheCleared?: (data: any) => void;
  public onVideoPreloaded?: (data: { url: string; success: boolean }) => void;
  public onNetworkChange?: (online: boolean) => void;

  public destroy(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = undefined;
    }
    
    if (this.messageChannel) {
      this.messageChannel.port1.close();
      this.messageChannel.port2.close();
    }
  }
}

export { ServiceWorkerManager };