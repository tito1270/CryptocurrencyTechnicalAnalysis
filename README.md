# Crypto Trading Analysis Platform

A comprehensive cryptocurrency trading analysis platform with advanced pair search, technical indicators, and automated recommendations.

## 🚀 New Features

### Enhanced Trading Pair Search
- **300 pairs per batch**: Browse trading pairs in manageable batches of 300
- **Advanced pagination**: Navigate through thousands of pairs with "Next" and "Previous" buttons
- **Progress tracking**: Visual progress bar shows completion percentage
- **Smart filtering**: Filter by crypto categories (DeFi, Gaming, AI, Meme, etc.)
- **Real-time search**: Instant search results as you type

### Automatic URL Updates
- **Shareable links**: When you select a trading pair, the URL automatically updates
- **Direct access**: Share specific pair analysis links with others
- **Bookmark support**: Bookmark your favorite trading pairs for quick access
- **Copy link button**: One-click copying of current analysis configuration

### URL Parameters
The platform supports URL parameters for direct access:
- `?pair=BTC/USDT` - Set trading pair
- `?broker=binance` - Set exchange (supported: binance, okx, coinbase, kucoin, bybit, etc.)
- `?timeframe=1h` - Set timeframe
- `?type=SPOT` - Set trade type

Example: `http://localhost:5173/?pair=ETH/USDT&broker=binance&timeframe=4h&type=SPOT`

## 🛠️ Features

- **Multi-exchange support**: 15+ exchanges including Binance, OKX, Coinbase, KuCoin, Bybit, and more
- **Smart broker selection**: Remembers your preferred exchange choice
- **Quick exchange switching**: Popular exchanges accessible with one click
- **Technical indicators**: 25+ indicators including RSI, MACD, Bollinger Bands
- **Trading strategies**: 16+ strategies for comprehensive analysis
- **Real-time data**: Live price feeds and market data
- **News integration**: Crypto news with sentiment analysis
- **Responsive design**: Works on desktop and mobile devices

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5173`

## 📱 Usage

### Trading Pair Selection
1. Click the **Search** button next to the trading pair dropdown
2. Use the search bar to find specific pairs
3. Filter by category using the filter toggle
4. Navigate through batches using "Next" and "Previous" buttons
5. Click on any pair to select it and automatically update the URL

### Sharing Analysis
1. Configure your trading parameters (pair, timeframe, indicators, etc.)
2. Click the **Copy** button to copy the current analysis link
3. Share the link with others for direct access to your configuration

### URL Navigation
- The URL automatically updates when you change trading pairs
- You can bookmark specific configurations
- Direct links work for sharing analysis setups

## 🎯 Key Improvements

- **Batch loading**: 300 pairs per page for better performance
- **Visual feedback**: Progress bars and completion indicators
- **Enhanced UX**: Improved search and navigation experience
- **URL integration**: Seamless sharing and bookmarking
- **Mobile responsive**: Optimized for all screen sizes

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📄 License

This project is licensed under the MIT License.
