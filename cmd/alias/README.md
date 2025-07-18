# Alias Management

Utilities để quản lý aliases trong dự án ES modules.

## Tính năng

- **Auto Sync**: Tự động đồng bộ aliases từ `import-map.json` sang `jsconfig.json`
- **Watch Mode**: Theo dõi thay đổi và tự động sync
- **Add Utility**: Thêm alias mới qua command line

## Files

```
cmd/alias/
├── index.js      # Export chính
├── sync.js       # Sync utilities
├── watch.js      # File watcher
├── watch-dev.js  # Development server + alias watch
├── add.js        # Add alias utility
└── README.md     # Documentation
```

## Cách sử dụng

### 1. Sync thủ công

```bash
node cmd/alias/sync.js
```

### 2. Watch mode (tự động sync)

```bash
node cmd/alias/watch.js
```

### 3. Thêm alias mới

```bash
node cmd/alias/add.js @newAlias ./path/to/directory
```

### 4. Development mode (server + alias watch)

```bash
node cmd/alias/watch-dev.js
# hoặc
npm run dev
```

### 5. Từ code

```javascript
import { syncAliases } from './cmd/alias/index.js';

syncAliases();
```

## Ví dụ

```bash
# Thêm alias mới
node cmd/alias/add.js @components ./src/components

# Sẽ thêm vào import-map.json:
# "@components/": "./src/components/"

# Và tự động cập nhật jsconfig.json:
# "@components/*": ["src/components/*"]
```

## NPM Scripts

Có thể thêm vào package.json:

```json
{
  "scripts": {
    "dev": "node cmd/alias/watch-dev.js",
    "alias:sync": "node cmd/alias/sync.js",
    "alias:watch": "node cmd/alias/watch.js",
    "alias:watch-dev": "node cmd/alias/watch-dev.js",
    "alias:add": "node cmd/alias/add.js"
  }
}
```

## Workflow

### Development Mode

1. Chạy `npm run dev` để bắt đầu development server
2. Server sử dụng Node.js `--watch` để tự động restart khi code thay đổi
3. Alias watcher theo dõi `import-map.json` và tự động sync
4. VS Code IntelliSense luôn cập nhật với aliases mới
5. Module loader resolve aliases trong runtime

### Manual Mode

1. Chỉnh sửa `import-map.json` hoặc dùng `add.js`
2. Script tự động cập nhật `jsconfig.json`
3. VS Code IntelliSense hoạt động với aliases mới
4. Module loader resolve aliases khi runtime
