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
      },
      {
        name: 'okx',
        url: 'wss://ws.okx.com:8443/ws/v5/public',
        parser: this.parseOKXWebSocket.bind(this),
        subscription: {
          op: "subscribe",
          args: [{ channel: "tickers", instType: "SPOT" }]
        }
      },
      {
        name: 'huobi',
        url: 'wss://api.huobi.pro/ws',
        parser: this.parseHuobiWebSocket.bind(this),
        subscription: {
          sub: "market.overview"
        }
      },
      {
        name: 'kraken',
        url: 'wss://ws.kraken.com',
        parser: this.parseKrakenWebSocket.bind(this),
        subscription: {
          event: "subscribe",
          pair: ["XBT/USD", "ETH/USD", "ADA/USD", "DOT/USD"],
          subscription: { name: "ticker" }
        }
      },
      {
        name: 'bitfinex',
        url: 'wss://api-pub.bitfinex.com/ws/2',
        parser: this.parseBitfinexWebSocket.bind(this),
        subscription: {
          event: "subscribe",
          channel: "ticker",
          symbol: "tBTCUSD"
        }
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
    try {
      const wsData = this.webSockets.get(exchangeName);
      if (!wsData) return;

      console.log(`🔌 Connecting to ${exchangeName.toUpperCase()} WebSocket...`);
      
      const socket = new WebSocket(url);
      wsData.socket = socket;
      
      socket.onopen = () => {
        console.log(`✅ ${exchangeName.toUpperCase()} WebSocket connected`);
        wsData.isConnected = true;
        wsData.reconnectAttempts = 0;
        wsData.lastHeartbeat = Date.now();
        
        if (subscription) {
          socket.send(JSON.stringify(subscription));
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
        wsData.socket = null;
        
        // Attempt reconnection
        if (wsData.reconnectAttempts < this.config.maxRetries) {
          wsData.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, wsData.reconnectAttempts), 30000);
          
          setTimeout(() => {
            this.connectWebSocket(exchangeName, url, parser, subscription);
          }, delay);
        }
      };
      
    } catch (error) {
      console.error(`❌ Failed to connect ${exchangeName.toUpperCase()} WebSocket:`, error);
    }
  }

  private parseBinanceWebSocket(data: any): PriceData[] {
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(item => item.s && item.c && parseFloat(item.c) > 0)
      .map(item => {
        const symbol = item.s;
        const pair = this.formatBinancePair(symbol);
        
        return {
          broker: 'binance',
          pair,
          price: parseFloat(item.c),
          change24h: parseFloat(item.P || '0'),
          volume: parseFloat(item.q || '0'),
          high24h: parseFloat(item.h || item.c),
          low24h: parseFloat(item.l || item.c),
          timestamp: Date.now()
        };
      })
      .filter(item => item.pair.includes('/'));
  }

  private parseOKXWebSocket(data: any): PriceData[] {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data
      .filter((item: any) => item.instId && item.last && parseFloat(item.last) > 0)
      .map((item: any) => ({
        broker: 'okx',
        pair: item.instId.replace('-', '/'),
        price: parseFloat(item.last),
        change24h: parseFloat(item.sodUtc8 || '0') * 100,
        volume: parseFloat(item.volCcy24h || '0'),
        high24h: parseFloat(item.high24h || item.last),
        low24h: parseFloat(item.low24h || item.last),
        timestamp: Date.now()
      }))
      .filter((item: any) => item.pair.includes('/'));
  }

  private parseHuobiWebSocket(data: any): PriceData[] {
    if (!data.tick || !Array.isArray(data.tick)) return [];
    
    return data.tick
      .filter((item: any) => item.symbol && item.close && parseFloat(item.close) > 0)
      .map((item: any) => ({
        broker: 'huobi',
        pair: this.formatHuobiPair(item.symbol),
        price: parseFloat(item.close),
        change24h: parseFloat(item.chg || '0'),
        volume: parseFloat(item.amount || '0'),
        high24h: parseFloat(item.high || item.close),
        low24h: parseFloat(item.low || item.close),
        timestamp: Date.now()
      }))
      .filter((item: any) => item.pair.includes('/'));
  }

  private parseKrakenWebSocket(data: any): PriceData[] {
    if (!Array.isArray(data) || data.length < 2) return [];
    
    const channelData = data[1];
    if (!channelData || typeof channelData !== 'object') return [];
    
    const pair = data[3]; // Pair is typically at index 3
    
    return [{
      broker: 'kraken',
      pair: this.formatKrakenPair(pair),
      price: parseFloat(channelData.c?.[0] || '0'),
      change24h: parseFloat(channelData.p?.[1] || '0'),
      volume: parseFloat(channelData.v?.[1] || '0'),
      high24h: parseFloat(channelData.h?.[1] || channelData.c?.[0] || '0'),
      low24h: parseFloat(channelData.l?.[1] || channelData.c?.[0] || '0'),
      timestamp: Date.now()
    }].filter(item => item.price > 0 && item.pair.includes('/'));
  }

  private parseBitfinexWebSocket(data: any): PriceData[] {
    if (!Array.isArray(data) || data.length < 2) return [];
    
    const channelData = data[1];
    if (!Array.isArray(channelData) || channelData.length < 10) return [];
    
    return [{
      broker: 'bitfinex',
      pair: 'BTC/USD', // Since we're subscribing to tBTCUSD
      price: parseFloat(channelData[6] || '0'), // Last price
      change24h: parseFloat(channelData[5] || '0'), // Daily change percent
      volume: parseFloat(channelData[7] || '0'), // Volume
      high24h: parseFloat(channelData[8] || channelData[6] || '0'),
      low24h: parseFloat(channelData[9] || channelData[6] || '0'),
      timestamp: Date.now()
    }].filter(item => item.price > 0);
  }

  private formatBinancePair(symbol: string): string {
    const stablecoins = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD'];
    const majors = ['BTC', 'ETH', 'BNB'];
    
    // Try stablecoins first
    for (const stable of stablecoins) {
      if (symbol.endsWith(stable)) {
        const base = symbol.slice(0, -stable.length);
        return `${base}/${stable}`;
      }
    }
    
    // Try major cryptos
    for (const major of majors) {
      if (symbol.endsWith(major)) {
        const base = symbol.slice(0, -major.length);
        return `${base}/${major}`;
      }
    }
    
    return symbol;
  }

  private formatHuobiPair(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    const bases = ['USDT', 'USDC', 'BTC', 'ETH', 'HT'];
    for (const base of bases) {
      if (upperSymbol.endsWith(base)) {
        const asset = upperSymbol.replace(base, '');
        return `${asset}/${base}`;
      }
    }
    return symbol.toUpperCase();
  }

  private formatKrakenPair(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'XBT': 'BTC',
      'XDG': 'DOGE'
    };
    
    let formatted = symbol;
    Object.entries(mapping).forEach(([kraken, standard]) => {
      formatted = formatted.replace(kraken, standard);
    });
    
    return formatted.replace('-', '/');
  }

  public subscribe(callback: LivePriceCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Live Price Streamer...');
    this.isRunning = true;
    this.retryCount = 0;
    
    // Initial price fetch
    await this.fetchAndBroadcastPrices();
    
    // Set up continuous polling (as backup to WebSockets)
    this.pollInterval = setInterval(() => {
      this.fetchAndBroadcastPrices();
      this.processWebSocketQueue();
      this.monitorWebSocketHealth();
    }, this.config.updateInterval);
    
    console.log(`✅ Live Price Streamer started (${this.config.updateInterval}ms intervals)`);
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping Live Price Streamer...');
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
    
    console.log('✅ Live Price Streamer stopped');
  }

  private async fetchAndBroadcastPrices(): Promise<void> {
    try {
      console.log('🔄 Fetching latest prices from all exchanges...');
      
      const timeoutPromise = new Promise<PriceData[]>((_, reject) =>
        setTimeout(() => reject(new Error('API timeout')), this.config.timeoutMs)
      );
      
      const pricesPromise = fetchRealTimePrices();
      const newPrices = await Promise.race([pricesPromise, timeoutPromise]);
      
      if (newPrices && newPrices.length > 0) {
        // Validate and sanitize prices
        const sanitizedPrices = priceValidator.sanitizePrices(newPrices);
        const validation = priceValidator.validatePrices(sanitizedPrices);
        
        this.lastPrices = sanitizedPrices;
        this.broadcastPrices(sanitizedPrices);
        this.retryCount = 0;
        
        console.log(`✅ Successfully fetched ${newPrices.length} live prices (${sanitizedPrices.length} after validation)`);
        
        // Log validation results
        if (validation.arbitrageOpportunities.length > 0) {
          console.log(`💰 Found ${validation.arbitrageOpportunities.length} arbitrage opportunities`);
        }
        if (!validation.isValid) {
          console.warn(`⚠️ Price validation issues: ${validation.anomalies.length} anomalies detected`);
        }
      } else {
        throw new Error('No prices received');
      }
      
    } catch (error) {
      console.error('❌ Error fetching live prices:', error);
      this.retryCount++;
      
      if (this.retryCount <= this.config.maxRetries) {
        console.log(`🔄 Retry ${this.retryCount}/${this.config.maxRetries} in 3 seconds...`);
        setTimeout(() => this.fetchAndBroadcastPrices(), 3000);
      } else if (this.lastPrices.length > 0) {
        // Use last known prices if we can't fetch new ones
        console.log('📊 Using last known prices as fallback');
        this.broadcastPrices(this.lastPrices);
      }
    }
  }

  private processWebSocketQueue(): void {
    if (this.priceUpdateQueue.length === 0) return;
    
    // Merge WebSocket updates with last known prices
    const updates = this.priceUpdateQueue.splice(0);
    const updatedPrices = [...this.lastPrices];
    
    updates.forEach(update => {
      const existingIndex = updatedPrices.findIndex(
        p => p.broker === update.broker && p.pair === update.pair
      );
      
      if (existingIndex > -1) {
        updatedPrices[existingIndex] = update;
      } else {
        updatedPrices.push(update);
      }
    });
    
    this.lastPrices = updatedPrices;
    this.broadcastPrices(updatedPrices);
    
    console.log(`🔄 Processed ${updates.length} WebSocket price updates`);
  }

  private monitorWebSocketHealth(): void {
    const now = Date.now();
    const heartbeatTimeout = 60000; // 1 minute
    
    this.webSockets.forEach((wsData, exchangeName) => {
      if (wsData.isConnected && (now - wsData.lastHeartbeat) > heartbeatTimeout) {
        console.warn(`💔 ${exchangeName.toUpperCase()} WebSocket heartbeat timeout, reconnecting...`);
        
        if (wsData.socket) {
          wsData.socket.close();
        }
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
    return this.lastPrices;
  }

  public getWebSocketStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.webSockets.forEach((wsData, exchangeName) => {
      status[exchangeName] = wsData.isConnected;
    });
    return status;
  }

  public isStreamingLive(): boolean {
    return this.isRunning && (
      Array.from(this.webSockets.values()).some(ws => ws.isConnected) ||
      this.retryCount < this.config.maxRetries
    );
  }
}

// Export singleton instance
export const livePriceStreamer = new LivePriceStreamer();
export default livePriceStreamer;