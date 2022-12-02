# CT Online wrapper

This is the unofficial Node.js wrapper for CT Online API

## Install

```bash
npm install --save ctonline-wrapper
```

## Getting started

### Authenticate with your credentials (provided by CT Internacional)

```javascript
import CTOnlineWrapper from "ctonline-wrapper";

const apiCredentials = {
  account: "HMO0001",
  rfc: "TEST860123FM3",
  email: "test@test.com",
};

const ftpCredentials = {
  host: "127.0.0.1",
  username: "HMO0001",
  password: "testT3st",
};

const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
```

### Get catalog (Array of products - complete product information)

```javascript
const getCatalog = await ctOnlineWrapper.products.getCatalog();
```

### Get catalog by code (Object of products by code as a key)

```javascript
const getCatalogByCode = await ctOnlineWrapper.products.getCatalogByCode();
```

### Get product stock

```javascript
const getStock = await ctOnlineWrapper.products.getStock("COMCPQ2020");
```

### Get stock of products from a specific warehouse

```javascript
const getStock = await ctOnlineWrapper.products.getStockByWarehouse(
  "COMCPQ2020",
  "01A"
);
```

### Get list of orders

```javascript
const getOrders = await ctOnlineWrapper.orders.get();
```

### Get order status

```javascript
const getOrderStatus = await ctOnlineWrapper.orders.getStatus("W99-0116391");
```

### Create order

```javascript
const newOrder = await ctOnlineWrapper.orders.create({
  idPedido: 506398,
  tipoPago: "04",
  envio: [],
  producto: [
    {
      cantidad: 1,
      clave: "CPUASS020",
      precio: 414.75,
      moneda: "MXN",
    },
    {
      cantidad: 1,
      clave: "NBKBIT010",
      precio: 676.5,
      moneda: "USD",
    },
  ],
});
```

### Confirm order

```javascript
const confirmMyOrder = await ctOnlineWrapper.orders.confirm("W99-0116391");
```
