import axios from "axios";
import * as NodeCache from "node-cache";

import type { AxiosInstance } from "axios";
import type {
  ApiCredentials,
  StandarStock,
  CTProductStock,
  CTProductStock2,
  CTPackaging,
  CTOrders,
  CTOrderCreate,
  CTOrderPayload,
  CTOrderStatus,
  CTGeneralResponse,
  SelectWarehouse,
  CTOrderProduct,
} from "./types";

const BASE_URL = "http://connect.ctonline.mx:3001";

// Create node cache instance
const myCache = new NodeCache();

export default class Wrapper {
  private client: AxiosInstance;
  private credentials: {
    email: string;
    client: string;
    rfc: string;
  };

  constructor(apiCredentials: ApiCredentials) {
    this.client = axios.create({
      baseURL: BASE_URL,
    });

    this.credentials = {
      email: apiCredentials.email,
      client: apiCredentials.account,
      rfc: apiCredentials.rfc,
    };
  }

  private async auth(): Promise<string | null> {
    try {
      const getToken = myCache.get("token") as string | undefined;

      if (getToken) {
        return getToken;
      }

      const response = await this.client.post(
        "/cliente/token",
        this.credentials
      );

      if (response?.data?.token) {
        myCache.set("token", response.data.token, 3600);
        return response.data.token;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  private async defineHeaders(): Promise<void> {
    try {
      const ACCESS_TOKEN = await this.auth();

      if (ACCESS_TOKEN !== undefined) {
        this.client.defaults.headers.common["x-auth"] = ACCESS_TOKEN;
      }

      return;
    } catch (e) {
      throw new Error("Failed authentication");
    }
  }

  private reduceWarehouse(
    productByWarehouse: CTProductStock,
    removeWarehouse: string[] = []
  ): StandarStock[] {
    const wareHouses = Object.keys(productByWarehouse);
    const stockWarehouse = [];

    for (const wareHouse of wareHouses) {
      if (productByWarehouse[wareHouse].existencia > 0) {
        if (removeWarehouse && !removeWarehouse.includes(wareHouse)) {
          stockWarehouse.push({
            almacen: wareHouse,
            stock: Number(productByWarehouse[wareHouse].existencia),
          });
        }
      }
    }

    return stockWarehouse;
  }

  async getStock(
    clavect: string,
    removeWarehouse: string[] = []
  ): Promise<StandarStock[]> {
    try {
      await this.defineHeaders();

      const response = await this.client.get(`/existencia/${clavect}`);

      if (response) {
        const { data }: { data: CTProductStock } = response;

        return this.reduceWarehouse(data, removeWarehouse);
      }

      return [];
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async getStockByWarehouse(
    clavect: string,
    almacen: string
  ): Promise<StandarStock | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.get(
        `/existencia/${clavect}/${almacen}`
      );

      if (response) {
        const { data }: { data: CTProductStock2 } = response;

        // Standardize response format
        return {
          almacen: data.almacen,
          stock: data.existencia,
        };
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async getPackaging(clavect: string): Promise<CTPackaging | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.get(
        `/paqueteria/volumetria/${clavect}`
      );

      if (response) {
        const { data }: { data: CTPackaging } = response;

        return data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async getOrders(): Promise<CTOrders | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.get("/pedido/listar");

      if (response) {
        const { data }: { data: CTOrders } = response;

        return data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async getOrderStatus(pedido: string): Promise<CTOrderStatus | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.get(`/pedido/estatus/${pedido}`);

      if (response) {
        const { data }: { data: CTOrderStatus } = response;

        return data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  private async selectWarehouse(
    orderProducts: CTOrderProduct[] = [],
    removeWarehouse: string[] = []
  ): Promise<SelectWarehouse[]> {
    try {
      const selectedComplete: SelectWarehouse[] = [];

      // Loop items...
      for (const product of orderProducts) {
        let selectedItem = 0;
        let reduceItem = product.cantidad;

        // Get Stock
        const getProductStock = product.clave
          ? await this.getStock(product.clave, removeWarehouse)
          : [];

        if (getProductStock && getProductStock.length > 0) {
          const sortStock = getProductStock.sort((a, b) => b.stock - a.stock);
          const inStock = sortStock
            .map((item) => item.stock)
            .reduce((total, item) => total + item);

          if (inStock >= product.cantidad) {
            // Loop GetStocks results...
            for (const productByStock of sortStock) {
              if (productByStock.stock / reduceItem >= 1) {
                if (selectedItem !== product.cantidad && reduceItem > 0) {
                  const checkAlreadyActiveWarehouse =
                    selectedComplete.findIndex(
                      (e) => e.almacen === productByStock.almacen
                    );

                  // Check if we already have the warehouse on the list.
                  if (checkAlreadyActiveWarehouse >= 0) {
                    selectedComplete[checkAlreadyActiveWarehouse].producto.push(
                      {
                        clave: product.clave,
                        cantidad: reduceItem,
                        precio: product.precio,
                        moneda: product.moneda,
                      }
                    );
                    selectedItem += reduceItem;
                    reduceItem = product.cantidad - selectedItem;
                  } else {
                    selectedComplete.push({
                      almacen: productByStock.almacen,
                      producto: [
                        {
                          clave: product.clave,
                          cantidad: reduceItem,
                          precio: product.precio,
                          moneda: product.moneda,
                        },
                      ],
                    });
                    selectedItem += reduceItem;
                    reduceItem = product.cantidad - selectedItem;
                  }
                }
              } else {
                // TODO: El almacen con mas inventario no acompleta el pedido.
                if (
                  selectedItem !== product.cantidad &&
                  reduceItem > 0 &&
                  productByStock.stock > 0
                ) {
                  const checkAlreadyActiveWarehouse =
                    selectedComplete.findIndex(
                      (e) => e.almacen === productByStock.almacen
                    );

                  // Check if we already have the warehouse on the list.
                  if (checkAlreadyActiveWarehouse >= 0) {
                    selectedComplete[checkAlreadyActiveWarehouse].producto.push(
                      {
                        clave: product.clave,
                        cantidad: productByStock.stock,
                        precio: product.precio,
                        moneda: product.moneda,
                      }
                    );
                    selectedItem += productByStock.stock;
                    reduceItem = product.cantidad - selectedItem;
                  } else {
                    selectedComplete.push({
                      almacen: productByStock.almacen,
                      producto: [
                        {
                          clave: product.clave,
                          cantidad: productByStock.stock,
                          precio: product.precio,
                          moneda: product.moneda,
                        },
                      ],
                    });
                    selectedItem += productByStock.stock;
                    reduceItem = product.cantidad - selectedItem;
                  }
                }
              }
            }
          } else {
            // No hay inventario suficiente.
            return [];
          }
        } else {
          // No hay inventario suficiente.
          return [];
        }
      }
      return selectedComplete;
    } catch (e) {
      return [];
    }
  }

  private createOrderPayload(
    order: CTOrderCreate,
    selectedWarehouse: SelectWarehouse
  ): CTOrderPayload {
    return {
      idPedido: order.idPedido,
      almacen: selectedWarehouse.almacen,
      tipoPago: order.tipoPago,
      envio: [],
      producto: selectedWarehouse.producto,
    };
  }

  async createOrder(
    order: CTOrderCreate,
    removeWarehouse: string[] = []
  ): Promise<CTOrders[] | null> {
    try {
      await this.defineHeaders();

      const responseBack: CTOrders[] = [];
      const selectedWarehouses = await this.selectWarehouse(
        order.producto,
        removeWarehouse
      );

      if (selectedWarehouses && !selectedWarehouses.length) {
        return null;
      }

      if (selectedWarehouses && selectedWarehouses.length) {
        for (const warehouse of selectedWarehouses) {
          const createOrder = this.createOrderPayload(order, warehouse);

          const response = await this.client.post("/pedido", createOrder);

          if (response) {
            const { data }: { data: CTOrders } = response;

            responseBack.push(data);
          }
        }

        return responseBack;
      }

      return responseBack;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async confirmOrder(pedidoWeb: string): Promise<CTGeneralResponse | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.post("/pedido/confirmar", {
        folio: pedidoWeb,
      });

      if (response) {
        const { data }: { data: CTGeneralResponse } = response;

        return data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }

  async sendLabel(payload: {
    folio: string;
    guias: {
      guia: string;
      paqueteria: string;
      archivo: string;
    }[];
  }): Promise<CTGeneralResponse | null> {
    try {
      await this.defineHeaders();

      const response = await this.client.post("/pedido/guias", payload);

      if (response) {
        const { data }: { data: CTGeneralResponse } = response;

        return data;
      }

      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) throw new Error(err.message);
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Unexpected error");
    }
  }
}
