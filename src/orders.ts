import Wrapper from "./wrapper";

import type { CTOrderCreate } from "./types";

export default class Orders {
  wrapper: Wrapper;

  constructor(wrapper: Wrapper) {
    this.wrapper = wrapper;
  }

  get() {
    return this.wrapper.getOrders();
  }

  getStatus(idPedido: string) {
    return this.wrapper.getOrderStatus(idPedido);
  }

  create(order: CTOrderCreate, removeWarehouse: string[] = []) {
    return this.wrapper.createOrder(order, removeWarehouse);
  }

  confirm(idPedido: string) {
    return this.wrapper.confirmOrder(idPedido);
  }

  sendLabel(payload: {
    folio: string;
    guias: {
      guia: string;
      paqueteria: string;
      archivo: string;
    }[];
  }) {
    return this.wrapper.sendLabel(payload);
  }
}
