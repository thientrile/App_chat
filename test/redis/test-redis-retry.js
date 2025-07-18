// Test script để kiểm tra Redis retry logic
import { init, getRetryInfo, resetRetryCount, isConnected, forceCloseConnection } from '../../pkg/redis/redis.js';

console.log('🧪 Testing Redis retry logic...');

// Log retry info trước khi bắt đầu
console.log('Initial retry info:', getRetryInfo());

// Khởi tạo Redis để trigger retry
console.log('🔄 Initializing Redis...');
init();

// Kiểm tra retry info sau 30 giây
setTimeout(() => {
  console.log('\n📊 Retry info after 30 seconds:');
  console.log(getRetryInfo());
  console.log('Connection status:', isConnected());
}, 30000);

// Dừng test sau 60 giây
setTimeout(() => {
  console.log('\n🛑 Test completed, forcing close...');
  forceCloseConnection();
  process.exit(0);
}, 60000);
