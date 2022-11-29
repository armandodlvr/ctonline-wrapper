import axios from "axios";

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

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CT Constructor", () => {
  it("Constructor", () => {
    expect.assertions(1);

    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);

    expect(ctOnlineWrapper).toBeInstanceOf(CTOnlineWrapper);
  });
});

describe("CT Wrapper - Private functions", () => {
  it("Auth", async () => {
    const wrapper = new Wrapper(apiCredentials);

    mockedAxios.post.mockResolvedValue({
      data: {
        token: "eyJhbGc",
        time: "2022-11-29T20:36:54.004Z",
      },
    });

    // @ts-expect-error
    const response = await wrapper.auth();

    expect(response).toEqual("eyJhbGc");
  });

  it("reduceWarehouse", () => {
    const wrapper = new Wrapper(apiCredentials);

    // @ts-expect-error
    const response = wrapper.reduceWarehouse({
      "01A": {
        existencia: 2774,
      },
      "02A": {
        existencia: 10,
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
      { almacen: "02A", stock: 10 },
      { almacen: "03A", stock: 801 },
      { almacen: "04A", stock: 7 },
    ]);
  });

  it("reduceWarehouse - remove warehouse without stock", () => {
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
  });

  it("reduceWarehouse - removing a warehouse", () => {
    const wrapper = new Wrapper(apiCredentials);

    // @ts-expect-error
    const response = wrapper.reduceWarehouse(
      {
        "01A": {
          existencia: 2774,
        },
        "02A": {
          existencia: 10,
        },
        "03A": {
          existencia: 801,
        },
        "04A": {
          existencia: 7,
        },
      },
      ["02A"]
    );

    expect(response).toEqual([
      { almacen: "01A", stock: 2774 },
      { almacen: "03A", stock: 801 },
      { almacen: "04A", stock: 7 },
    ]);
  });

  it("selectWarehouse - warehouse with more stock", async () => {
    const wrapper = new Wrapper(apiCredentials);

    jest
      .spyOn(wrapper, "getStock")
      .mockReturnValueOnce(Promise.resolve([{ almacen: "01A", stock: 2774 }]))
      .mockReturnValueOnce(
        Promise.resolve([
          { almacen: "13A", stock: 4 },
          { almacen: "03A", stock: 801 },
          { almacen: "04A", stock: 7 },
        ])
      );

    // @ts-expect-error
    const response = await wrapper.selectWarehouse([
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
    ]);

    expect(response).toEqual([
      {
        almacen: "01A",
        producto: [
          { clave: "CPUASS020", cantidad: 1, precio: 414.75, moneda: "MXN" },
        ],
      },
      {
        almacen: "03A",
        producto: [
          { clave: "NBKBIT010", cantidad: 1, precio: 676.5, moneda: "USD" },
        ],
      },
    ]);
  });

  it("createOrderPayload", () => {
    const wrapper = new Wrapper(apiCredentials);

    // @ts-expect-error
    const response = wrapper.createOrderPayload(
      {
        idPedido: 1234,
        tipoPago: "99",
        producto: [
          { clave: "NBKBIT010", cantidad: 1, precio: 676.5, moneda: "USD" },
        ],
      },
      {
        almacen: "03A",
        producto: [
          { clave: "NBKBIT010", cantidad: 1, precio: 676.5, moneda: "USD" },
        ],
      }
    );

    expect(response).toEqual({
      idPedido: 1234,
      almacen: "03A",
      tipoPago: "99",
      envio: [],
      producto: [
        { clave: "NBKBIT010", cantidad: 1, precio: 676.5, moneda: "USD" },
      ],
    });
  });
});
