# Index Utils - Utility Functions Documentation

This module provides a collection of utility functions for various operations including object manipulation, data transformation, MongoDB operations, and validation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Object Manipulation](#object-manipulation)
  - [Data Selection](#data-selection)
  - [MongoDB Utilities](#mongodb-utilities)
  - [Cryptography](#cryptography)
  - [Validation](#validation)
  - [ID Generation](#id-generation)
- [Examples](#examples)

## Installation

Make sure you have the required dependencies installed:

```bash
npm install lodash mongoose joi
```

## Usage

Import the utility functions you need:

```javascript
import {
  getInfoData,
  omitInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefineObject,
  updateNestedObject,
  convertToObjectIdMongoose,
  converToUUIDMongoose,
  addPrefixToKeys,
  removePrefixFromKeys,
  randomId,
  createMongoObjectId,
  generatedKey,
  JoiValidate
} from './pkg/utils/index.utils.js';
```

## API Reference

### Object Manipulation

#### `getInfoData({ fields, object })`

Retrieves specified fields from an object using lodash's pick function.

**Parameters:**
- `fields` (Array): Array of field names to extract
- `object` (Object): Source object to extract fields from

**Returns:** Object containing only the specified fields

**Example:**
```javascript
const user = { name: 'John', age: 30, email: 'john@example.com', password: '123' };
const publicInfo = getInfoData({ 
  fields: ['name', 'email'], 
  object: user 
});
// Result: { name: 'John', email: 'john@example.com' }
```

#### `omitInfoData({ fields, object })`

Removes specified fields from an object using lodash's omit function.

**Parameters:**
- `fields` (Array): Array of field names to remove
- `object` (Object): Source object to remove fields from

**Returns:** Object with specified fields removed

**Example:**
```javascript
const user = { name: 'John', age: 30, email: 'john@example.com', password: '123' };
const safeUser = omitInfoData({ 
  fields: ['password'], 
  object: user 
});
// Result: { name: 'John', age: 30, email: 'john@example.com' }
```

#### `removeUndefineObject(obj)`

Removes properties with null or undefined values from an object.

**Parameters:**
- `obj` (Object): Object to clean

**Returns:** Object with null/undefined properties removed

**Example:**
```javascript
const data = { name: 'John', age: null, email: 'john@example.com', city: undefined };
const cleaned = removeUndefineObject(data);
// Result: { name: 'John', email: 'john@example.com' }
```

#### `updateNestedObject(obj)`

Recursively flattens a nested object by converting nested properties to dot notation.

**Parameters:**
- `obj` (Object): Nested object to flatten

**Returns:** Flattened object with dot notation keys

**Example:**
```javascript
const nested = {
  user: {
    profile: {
      name: 'John',
      age: 30
    },
    settings: {
      theme: 'dark'
    }
  }
};
const flattened = updateNestedObject(nested);
// Result: { 'user.profile.name': 'John', 'user.profile.age': 30, 'user.settings.theme': 'dark' }
```

#### `addPrefixToKeys(obj, prefix, excludedKeys = [])`

Adds a prefix to object keys, with option to exclude specific keys.

**Parameters:**
- `obj` (Object): Object to modify
- `prefix` (string): Prefix to add to keys
- `excludedKeys` (Array): Keys to exclude from prefixing

**Returns:** Object with prefixed keys

**Example:**
```javascript
const data = { name: 'John', age: 30, id: '123' };
const prefixed = addPrefixToKeys(data, 'user_', ['id']);
// Result: { user_name: 'John', user_age: 30, id: '123' }
```

#### `removePrefixFromKeys(obj, prefix)`

Removes a prefix from object keys.

**Parameters:**
- `obj` (Object): Object to modify
- `prefix` (string): Prefix to remove

**Returns:** Object with prefix removed from keys

**Example:**
```javascript
const data = { user_name: 'John', user_age: 30, id: '123' };
const unprefixed = removePrefixFromKeys(data, 'user_');
// Result: { name: 'John', age: 30, id: '123' }
```

### Data Selection

#### `getSelectData(select = [])`

Converts an array of field names into a MongoDB select object with value 1 (include fields).

**Parameters:**
- `select` (Array): Array of field names to include

**Returns:** Object with field names as keys and value 1

**Example:**
```javascript
const fields = ['name', 'email', 'age'];
const selectObj = getSelectData(fields);
// Result: { name: 1, email: 1, age: 1 }

// Usage with MongoDB query
User.find({}).select(selectObj);
```

#### `unGetSelectData(select = [])`

Converts an array of field names into a MongoDB select object with value 0 (exclude fields).

**Parameters:**
- `select` (Array): Array of field names to exclude

**Returns:** Object with field names as keys and value 0

**Example:**
```javascript
const fields = ['password', 'secretKey'];
const excludeObj = unGetSelectData(fields);
// Result: { password: 0, secretKey: 0 }

// Usage with MongoDB query
User.find({}).select(excludeObj);
```

### MongoDB Utilities

#### `convertToObjectIdMongoose(id)`

Converts a string ID to a MongoDB ObjectId.

**Parameters:**
- `id` (string): String ID to convert

**Returns:** MongoDB ObjectId

**Example:**
```javascript
const stringId = '507f1f77bcf86cd799439011';
const objectId = convertToObjectIdMongoose(stringId);
// Result: ObjectId('507f1f77bcf86cd799439011')
```

#### `converToUUIDMongoose(id)`

Converts a string ID to a MongoDB UUID object.

**Parameters:**
- `id` (string): String ID to convert

**Returns:** MongoDB UUID object

**Example:**
```javascript
const uuidString = '550e8400-e29b-41d4-a716-446655440000';
const uuidObj = converToUUIDMongoose(uuidString);
```

#### `createMongoObjectId()`

Creates a new MongoDB ObjectId.

**Returns:** New MongoDB ObjectId

**Example:**
```javascript
const newId = createMongoObjectId();
// Result: ObjectId('507f1f77bcf86cd799439012')
```

### Cryptography

#### `generatedKey(length = 2048)`

Generates an RSA key pair for cryptographic operations.

**Parameters:**
- `length` (number): Modulus length in bits (default: 2048)

**Returns:** Object containing public and private keys in PEM format

**Example:**
```javascript
const keyPair = generatedKey(2048);
console.log(keyPair.publicKey);  // PEM formatted public key
console.log(keyPair.privateKey); // PEM formatted private key

// Generate with custom length
const keyPair4096 = generatedKey(4096);
```

### Validation

#### `JoiValidate(schema, input)`

Validates input against a Joi schema and throws an error if validation fails.

**Parameters:**
- `schema` (Joi.Schema): Joi validation schema
- `input` (any): Data to validate

**Throws:** BadRequestError if validation fails

**Example:**
```javascript
import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(0).required(),
  email: Joi.string().email().required()
});

const userData = { name: 'John', age: 30, email: 'john@example.com' };

try {
  JoiValidate(userSchema, userData);
  console.log('Validation passed');
} catch (error) {
  console.log('Validation failed:', error.message);
}
```

### ID Generation

#### `randomId()`

Generates a random ID by combining current timestamp with a random number.

**Returns:** String ID

**Example:**
```javascript
const id1 = randomId();
const id2 = randomId();
console.log(id1); // "1642612345678123"
console.log(id2); // "1642612345679456"
```

## Examples

### Complete User Data Processing Example

```javascript
import {
  getInfoData,
  omitInfoData,
  removeUndefineObject,
  convertToObjectIdMongoose,
  getSelectData,
  randomId
} from './pkg/utils/index.utils.js';

// Sample user data from database
const userData = {
  _id: '507f1f77bcf86cd799439011',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  age: null,
  profile: {
    bio: 'Software Developer',
    location: undefined,
    avatar: 'avatar.jpg'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// 1. Clean undefined/null values
const cleanedData = removeUndefineObject(userData);

// 2. Get only public information
const publicInfo = getInfoData({
  fields: ['name', 'email', 'profile', 'createdAt'],
  object: cleanedData
});

// 3. Remove sensitive information
const safeData = omitInfoData({
  fields: ['password', '_id'],
  object: userData
});

// 4. Generate new ID for response
const responseId = randomId();

// 5. Convert string ID to ObjectId for database query
const objectId = convertToObjectIdMongoose('507f1f77bcf86cd799439011');

// 6. Create MongoDB select object for query
const selectFields = getSelectData(['name', 'email', 'profile']);

console.log('Response ID:', responseId);
console.log('Public Info:', publicInfo);
console.log('Safe Data:', safeData);
console.log('MongoDB Select:', selectFields);
```

### MongoDB Query Example

```javascript
import {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongoose
} from './pkg/utils/index.utils.js';

// Include specific fields
const includeFields = getSelectData(['name', 'email', 'createdAt']);
const users = await User.find({}).select(includeFields);

// Exclude sensitive fields
const excludeFields = unGetSelectData(['password', 'secretKey']);
const publicUsers = await User.find({}).select(excludeFields);

// Find by ObjectId
const userId = convertToObjectIdMongoose('507f1f77bcf86cd799439011');
const user = await User.findById(userId);
```

## Dependencies

- **lodash**: For object manipulation functions
- **mongoose**: For MongoDB ObjectId and UUID operations
- **joi**: For data validation
- **node:crypto**: For key generation

## Notes

- The `JoiValidate` function references `next` and `BadRequestError` which should be available in your application context
- All functions are exported using ES6 module syntax
- MongoDB utilities require mongoose to be properly configured in your application
- The cryptographic functions use Node.js built-in crypto module
