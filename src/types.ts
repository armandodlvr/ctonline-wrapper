export type ApiCredentials = {
  account: string;
  rfc: string;
  email: string;
};

export type FtpCredentials = {
  host: string;
  user: string;
  password: string;
};

export type StandarStock = {
  almacen: string;
  stock: number;
};

export type CTProductStock = {
  [key: string]: {
    existencia: number;
  };
};

export type CTProductStock2 = {
  almacen: string;
  existencia: number;
};

export type CTPackaging = {
  peso: number;
  largo: number;
  alto: number;
  ancho: number;
  UPC: string;
  EAN: string;
};

export type CTShipping = {
  nombre: string;
  direccion: string;
  entreCalles: string;
  noExterior: string;
  colonia: string;
  estado: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
};

export type CTOrderProduct = {
  cantidad: number;
  clave: string;
  precio: number;
  moneda: "MXN" | "USD";
};

export type CTOrderCreate = {
  idPedido: number;
  tipoPago: "01" | "02" | "03" | "04" | "99";
  producto: CTOrderProduct[];
};

export type CTOrderPayload = {
  idPedido: number;
  almacen: string;
  tipoPago: string;
  envio?: CTShipping[];
  producto: CTOrderProduct[];
};

export type CTOrders = {
  idPedido: number;
  almacen: string;
  tipoPago: string;
  envio?: CTShipping[];
  producto: CTOrderProduct[];
  respuestaCT: {
    pedidoWeb: string;
    estatus: string;
    errores?: CTErrores[];
  };
};

export type CTErrores = {
  errorCode: number;
  errorMessage: string;
  errorReference: string;
};

export type CTGeneralResponse = {
  okCode: number;
  okMessage: string;
  okReference: string;
};

export type CTOrderStatus = {
  status: string;
  folio: string;
};

export type SelectWarehouse = {
  almacen: string;
  producto: CTOrderProduct[];
};

export type CTProduct = {
  idProducto: number;
  clave: string;
  numParte: string;
  nombre: string;
  modelo: string;
  idMarca: number;
  marca: string;
  idSubCategoria: number;
  subcategoria: string;
  idCategoria: number;
  categoria: string;
  descripcion_corta: string;
  ean: string | null;
  upc: string | null;
  sustituto?: string | null;
  activo: number;
  protegido: number;
  existencia: { [key: string]: number };
  precio: number;
  moneda: string;
  tipoCambio: number;
  especificaciones?: { tipo: string; valor: string }[] | null;
  promociones?: [] | null;
  imagen: string;
};

export type StandardProduct = {
  code: string;
  sku: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  ean: string | null;
  upc: string | null;
  substitute: string | null;
  cost: number;
  inStock: number;
  byWarehouse: StandarStock[];
  currency: number;
  exchangeRate: number;
  specs?: { tipo: string; valor: string }[] | null;
  image: string;
};

export type GroupProductsByCode = {
  [key: string]: {
    cost: number;
    inStock: number;
    byWarehouse: StandarStock[];
    currency: string;
    exchangeRate: number;
  };
};
