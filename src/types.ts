export type ApiCredentials = {
  account: string;
  rfc: string;
  email: string;
};

export type FtpCredentials = {
  host: string;
  username: string;
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
  };
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
