import { brokers } from './src/data/brokers.js';

console.log('Broker Pairs Count:');
console.log('==================');

brokers.forEach(broker => {
  console.log(`${broker.name}: ${broker.pairs.length} pairs`);
});

// Show sample pairs for first broker
console.log('\nSample pairs from Binance:');
console.log(brokers[0].pairs.slice(0, 10));
