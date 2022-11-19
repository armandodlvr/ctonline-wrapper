CTOnlineWrapper
=========

This is the unofficial Node.js wrapper for CT Online API

## Install

```bash
npm install --save ctonline-wrapper
```

## Getting started

### Authenticate with your credentials (provided by CT)

```javascript
import CTOnlineWrapper from 'ctonline-wrapper';

const ctOnlineWrapper = new CTOnlineWrapper({
  apiCredentials: {
    account: 'string',
    rfc: 'string',
    email: 'string'
  },
  ftpCredentials: {
    host: 'string',
    username: 'string',
    password: 'string'
  }
});
```
