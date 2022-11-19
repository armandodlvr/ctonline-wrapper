import Wrapper from "./wrapper";
import Products from "./products";
import Orders from "./orders";

import type { ApiCredentials, FtpCredentials } from "./types";

/**
 * Get an instance of the CT Online library
 * @class
 * @param {string} apiKey Test or Live key.
 * @returns {CTOnlineWrapper} Instance of this library
 */

export default class CTOnlineWrapper {
  products: Products;
  orders: Orders;

  constructor(apiCredentials: ApiCredentials, ftpCredentials: FtpCredentials) {
    const wrapper = new Wrapper(apiCredentials);
    this.products = new Products(wrapper, ftpCredentials);
    this.orders = new Orders(wrapper);
  }
}
