import { PriceData } from '../types';
import { fetchRealTimePrices } from './priceAPI';
import priceValidator from './priceValidator';

interface PriceStreamConfig {
  updateInterval: number;
  maxRetries: number;
  timeoutMs: number;
  enableWebSockets: boolean;
}

interface LivePriceCallback {
  (prices: PriceData[]): void;
}

interface ExchangeWebSocket {
  name: string;
  url: string;
  isConnected: boolean;
  socket: WebSocket | null;
  reconnectAttempts: number;
  lastHeartbeat: number;
}

class LivePriceStreamer {
  private config: PriceStreamConfig;
  private callbacks: LivePriceCallback[] = [];
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastPrices: PriceData[] = [];
  private webSockets: Map<string, ExchangeWebSocket> = new Map();
  private priceUpdateQueue: PriceData[] = [];
  private retryCount: number = 0;

  constructor(config: Partial<PriceStreamConfig> = {}) {
    this.config = {
      updateInterval: 5000, // 5 seconds for super live updates
      maxRetries: 3,
      timeoutMs: 8000,
      enableWebSockets: true,
      ...config
    };

    this.initializeWebSockets();
  }

  private initializeWebSockets(): void {
    if (!this.config.enableWebSockets) return;

    const wsConfig = [
      {
        name: 'binance',
        url: 'wss://stream.binance.com:9443/ws/!ticker@arr',
        parser: this.parseBinanceWebSocket.bind(this)
      }
    ];

    wsConfig.forEach(({ name, url, parser, subscription }) => {
      const wsData: ExchangeWebSocket = {
        name,
        url,
        isConnected: false,
        socket: null,
        reconnectAttempts: 0,
        lastHeartbeat: Date.now()
      };

      this.webSockets.set(name, wsData);
      this.connectWebSocket(name, url, parser, subscription);
    });
  }

  private connectWebSocket(
    exchangeName: string, 
    url: string, 
    parser: (data: any) => PriceData[], 
    subscription?: any
  ): void {
    const wsData = this.webSockets.get(exchangeName);
    if (!wsData) return;

    console.log(`🔌 Connecting to ${exchangeName.toUpperCase()} WebSocket...`);

    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log(`✅ ${exchangeName.toUpperCase()} WebSocket connected`);
      wsData.isConnected = true;
      wsData.reconnectAttempts = 0;
      wsData.lastHeartbeat = Date.now();

      // Send subscription message if needed
      if (subscription) {
        socket.send(JSON.stringify(subscription));
        console.log(`📡 Sent subscription to ${exchangeName.toUpperCase()}`);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const prices = parser(data);
        
        if (prices.length > 0) {
          this.priceUpdateQueue.push(...prices);
          wsData.lastHeartbeat = Date.now();
        }
      } catch (error) {
        console.warn(`⚠️ ${exchangeName.toUpperCase()} WebSocket parsing error:`, error);
      }
    };

    socket.onerror = (error) => {
      console.error(`❌ ${exchangeName.toUpperCase()} WebSocket error:`, error);
      wsData.isConnected = false;
    };

    socket.onclose = () => {
      console.log(`🔌 ${exchangeName.toUpperCase()} WebSocket disconnected`);
      wsData.isConnected = false;

      // Attempt reconnection
      if (wsData.reconnectAttempts < this.config.maxRetries) {
        wsData.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, wsData.reconnectAttempts), 30000);
        
        setTimeout(() => {
          console.log(`🔄 Reconnecting ${exchangeName.toUpperCase()} WebSocket (attempt ${wsData.reconnectAttempts})...`);
          this.connectWebSocket(exchangeName, url, parser, subscription);
        }, delay);
      }
    };

    wsData.socket = socket;
  }

  private parseBinanceWebSocket(data: any): PriceData[] {
    try {
      if (!Array.isArray(data)) return [];

      return data
        .filter(ticker => ticker.s && ticker.c && parseFloat(ticker.c) > 0)
        .map(ticker => {
          // Convert Binance symbol format to standard pair format
          const symbol = ticker.s;
          let pair = '';

          // Handle common quote currencies
          if (symbol.endsWith('USDT')) {
            pair = `${symbol.slice(0, -4)}/USDT`;
          } else if (symbol.endsWith('USDC')) {
            pair = `${symbol.slice(0, -4)}/USDC`;
          } else if (symbol.endsWith('BTC')) {
            pair = `${symbol.slice(0, -3)}/BTC`;
          } else if (symbol.endsWith('ETH')) {
            pair = `${symbol.slice(0, -3)}/ETH`;
          } else if (symbol.endsWith('BNB')) {
            pair = `${symbol.slice(0, -3)}/BNB`;
          } else {
            pair = symbol;
          }

          return {
            symbol: pair,
            price: parseFloat(ticker.c),
            change24h: parseFloat(ticker.P) || 0,
            volume24h: parseFloat(ticker.v) || 0,
            high24h: parseFloat(ticker.h) || 0,
            low24h: parseFloat(ticker.l) || 0,
            broker: 'binance',
            timestamp: Date.now(),
            source: 'WEBSOCKET' as const
          };
        })
        .filter(price => price.symbol.includes('/'));
    } catch (error) {
      console.error('❌ Error parsing Binance WebSocket data:', error);
      return [];
    }
  }

  public subscribe(callback: LivePriceCallback): void {
    this.callbacks.push(callback);
  }

  public unsubscribe(callback: LivePriceCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  public start(): void {
    if (this.isRunning) {
      console.log('🚀 Live price streamer already running');
      return;
    }

    console.log('🚀 Starting live price streamer...');
    this.isRunning = true;
    this.retryCount = 0;

    // Set up continuous polling (as backup to WebSockets)
    this.pollInterval = setInterval(() => {
      this.fetchAndBroadcast();
      this.processWebSocketQueue();
      this.monitorWebSocketHealth();
    }, this.config.updateInterval);

    // Initial fetch
    this.fetchAndBroadcast();
  }

  public stop(): void {
    console.log('🛑 Stopping live price streamer...');
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Close all WebSocket connections
    this.webSockets.forEach((wsData, exchangeName) => {
      if (wsData.socket) {
        wsData.socket.close();
        console.log(`🔌 Closed ${exchangeName.toUpperCase()} WebSocket`);
      }
    });

    this.callbacks = [];
    this.lastPrices = [];
    this.priceUpdateQueue = [];
  }

  private async fetchAndBroadcast(): Promise<void> {
    try {
      console.log('📡 Fetching live prices...');

      const prices = await fetchRealTimePrices();
      
      if (prices.length === 0) {
        this.retryCount++;
        console.warn(`⚠️ No prices received (retry ${this.retryCount}/${this.config.maxRetries})`);
        
        if (this.retryCount >= this.config.maxRetries) {
          console.error('❌ Max retries reached, using last known prices');
          this.broadcastPrices(this.lastPrices);
          return;
        }
      } else {
        this.retryCount = 0;
        this.lastPrices = prices;
      }

      // Validate prices before broadcasting
      const validatedPrices = priceValidator.validatePrices(prices);
      console.log(`✅ Broadcasting ${validatedPrices.length} validated prices`);

      this.broadcastPrices(validatedPrices);

    } catch (error) {
      console.error('❌ Error fetching live prices:', error);
      this.retryCount++;
      
      if (this.retryCount < this.config.maxRetries) {
        console.log(`🔄 Retrying in ${this.config.updateInterval}ms...`);
      } else {
        console.log('🔄 Using last known prices due to repeated failures');
        this.broadcastPrices(this.lastPrices);
      }
    }
  }

  private processWebSocketQueue(): void {
    if (this.priceUpdateQueue.length === 0) return;

    // Merge WebSocket updates with last known prices
    const updates = [...this.priceUpdateQueue];
    this.priceUpdateQueue = [];

    // Group by symbol for deduplication
    const latestPrices = new Map<string, PriceData>();
    
    // Start with last known prices
    this.lastPrices.forEach(price => {
      latestPrices.set(price.symbol, price);
    });

    // Apply WebSocket updates (they're more recent)
    updates.forEach(update => {
      latestPrices.set(update.symbol, update);
    });

    const mergedPrices = Array.from(latestPrices.values());
    
    if (updates.length > 0) {
      console.log(`🔄 Processed ${updates.length} WebSocket price updates`);
      this.broadcastPrices(mergedPrices);
    }
  }

  private monitorWebSocketHealth(): void {
    const now = Date.now();
    const healthTimeout = 60000; // 1 minute

    this.webSockets.forEach((wsData, exchangeName) => {
      if (wsData.isConnected && now - wsData.lastHeartbeat > healthTimeout) {
        console.warn(`💔 ${exchangeName.toUpperCase()} WebSocket heartbeat timeout, reconnecting...`);
        wsData.socket?.close();
      }
    });
  }

  private broadcastPrices(prices: PriceData[]): void {
    this.callbacks.forEach(callback => {
      try {
        callback(prices);
      } catch (error) {
        console.error('❌ Error in price callback:', error);
      }
    });
  }

  public getLastPrices(): PriceData[] {
    return [...this.lastPrices];
  }

  public getStreamStatus(): {
    isRunning: boolean;
    lastUpdate: number;
    priceCount: number;
    retryCount: number;
  } {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastPrices.length > 0 ? Math.max(...this.lastPrices.map(p => p.timestamp)) : 0,
      priceCount: this.lastPrices.length,
      retryCount: this.retryCount
    };
  }

  public getWebSocketStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.webSockets.forEach((wsData, exchangeName) => {
      status[exchangeName] = wsData.isConnected;
    });
    return status;
  }

  public isHealthy(): boolean {
    return this.isRunning && 
           (this.lastPrices.length > 0 || 
            Array.from(this.webSockets.values()).some(ws => ws.isConnected)) ||
           this.retryCount < this.config.maxRetries;
  }
}

// Global instance
const livePriceStreamer = new LivePriceStreamer();

export default livePriceStreamer;