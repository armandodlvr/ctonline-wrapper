import CTOnlineWrapper from "../src";
import Wrapper from "../src/wrapper";

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

describe("CT Constructor", () => {
  it("Constructor", () => {
    expect.assertions(1);

    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);

    expect(ctOnlineWrapper).toBeInstanceOf(CTOnlineWrapper);
  });
});

describe("CT Wrapper", () => {
  it("reduceWarehouse", () => {
    const wrapper = new Wrapper(apiCredentials);

    // @ts-expect-error
    const response = wrapper.reduceWarehouse({
      "01A": {
        existencia: 2774,
      },
      "02A": {
        existencia: 0,
      },
      "03A": {
        existencia: 801,
      },
      "04A": {
        existencia: 7,
      },
    });

    expect(response).toEqual([
      { almacen: "01A", stock: 2774 },
      { almacen: "03A", stock: 801 },
      { almacen: "04A", stock: 7 },
    ]);

    it("reduceWarehouse removing a warehouse", () => {
      
    });
  });
});
