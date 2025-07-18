# Module Loader

Custom ES Module loader cho dự án Node.js này.

## Tính năng

- **Alias Resolution**: Tự động resolve các import aliases (@global, @logger, v.v.)
- **Auto Extension**: Tự động thêm `.js` extension cho local files
- **Import Map**: Sử dụng `import-map.json` để định nghĩa aliases
- **Integrated**: Được tích hợp trực tiếp vào source code

## Cấu trúc

```
pkg/loader/
├── index.js      # Export chính
├── loader.js     # Custom loader implementation
└── README.md     # Documentation
```

## Cách hoạt động

Loader được tự động đăng ký trong `app.js` (entry point chính):

```javascript
// app.js
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register module loader - must be first!
register('./pkg/loader/loader.js', pathToFileURL('./'));

// Import server
import('./cmd/server/server.js');
```

## Cách sử dụng

Đơn giản chạy các NPM scripts:

```bash
npm run dev    # Development mode
npm start      # Production mode
npm run watch  # Watch mode
```

Tất cả đều sử dụng `app.js` làm entry point, loader sẽ tự động hoạt động.

## Import Aliases được hỗ trợ

- `@pkg/` → `pkg/`
- `@global/` → `global/`
- `@configs/` → `configs/`
- `@internal/` → `internal/`
- `@initializes/` → `internal/initializes/`
- `@middlewares/` → `internal/middlewares/`
- `@modules/` → `internal/modules/`
- `@consts/` → `internal/consts/`
- `@utils/` → `pkg/utils/`
- `@logger/` → `pkg/logger/`
- `@loader/` → `pkg/loader/`
- `@mongodb/` → `pkg/mongodb/`
- `@response/` → `pkg/response/`
- `@async/` → `pkg/async/`
- `@cloudinary/` → `pkg/cloudinary/`
- `@multer/` → `pkg/multer/`
- `@context/` → `pkg/context/`
- `@storage/` → `storage/`
- `@logs/` → `logs/`
- `@cmd/` → `cmd/`

## Ví dụ

```javascript
// Thay vì:
import { Logger } from '../../global/global.js';

// Có thể dùng:
import { Logger } from '@global/global.js';
```
