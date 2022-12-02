import Wrapper from "./wrapper";

export default class Products {
  wrapper: Wrapper;

  constructor(wrapper: Wrapper) {
    this.wrapper = wrapper;
  }

  getCatalog() {
    return this.wrapper.getCatalog();
  }

  getCatalogByCode() {
    return this.wrapper.getCatalogByCode;
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
