import Wrapper from "./wrapper";

import type { FtpCredentials } from "./types";

export default class Products {
  wrapper: Wrapper;

  constructor(wrapper: Wrapper, _ftpCredentials: FtpCredentials) {
    this.wrapper = wrapper;
  }

  getStock(clavect: string, removeWarehouse: string[] = []) {
    return this.wrapper.getStock(clavect, removeWarehouse);
  }

  getStockByWarehouse(clavect: string, almacen: string) {
    return this.wrapper.getStockByWarehouse(clavect, almacen);
  }

  packaging(clavect: string) {
    return this.wrapper.getPackaging(clavect);
  }
}
