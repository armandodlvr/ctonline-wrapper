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

describe("CT Products", () => {
  it("Get stock", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);

    mockedAxios.get.mockResolvedValue({
      data: {
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
        "05A": {
          existencia: 13,
        },
      },
    });

    const getCTStock = await ctOnlineWrapper.products.getStock("COMCPQ2020");

    expect(getCTStock).toEqual([
      { almacen: "01A", stock: 2774 },
      { almacen: "03A", stock: 801 },
      { almacen: "04A", stock: 7 },
      { almacen: "05A", stock: 13 },
    ]);
  });

  it("Get stock by warehouse", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = {
      almacen: "01A",
      existencia: 2774,
    };

    mockedAxios.get.mockResolvedValue({
      data: mockResponseValue,
    });

    const getCTStock = await ctOnlineWrapper.products.getStockByWarehouse(
      "COMCPQ2020",
      "01A"
    );

    expect(getCTStock).toEqual({ almacen: "01A", stock: 2774 });
  });

  it("Packaging + UPC/EAN (barcode)", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = [
      {
        peso: 5.5,
        largo: 40,
        alto: 28.8,
        ancho: 18,
        UPC: "097855070081",
        EAN: "017825670088",
      },
    ];

    mockedAxios.get.mockResolvedValue({
      data: mockResponseValue,
    });

    const getCTPackaging = await ctOnlineWrapper.products.packaging(
      "COMCPQ2020"
    );

    expect(getCTPackaging).toEqual(mockResponseValue);
  });
});

describe("CT Orders", () => {
  it("Get orders", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = [
      {
        idPedido: 506398,
        producto: [
          {
            cantidad: "1",
            clave: "MEMDAT3220",
            precio: "3.970000",
            moneda: "USD",
          },
        ],
        respuestaCT: {
          pedidoWeb: "PHM-055555",
          estatus: "Confirmado",
        },
      },
      {
        idPedido: 506398,
        producto: [
          {
            cantidad: "1",
            clave: "MEMDAT3220",
            precio: "3.970000",
            moneda: "USD",
          },
          {
            cantidad: "1",
            clave: "CARGO100",
            precio: "2.89701648",
            moneda: "MXN",
          },
        ],
        respuestaCT: {
          pedidoWeb: "PHM-055554",
          estatus: "Pendiente",
        },
      },
      {
        idPedido: 506398,
        producto: [
          {
            cantidad: "1",
            clave: "MEMDAT3220",
            precio: "3.970000",
            moneda: "USD",
          },
          {
            cantidad: "1",
            clave: "CARGO100",
            precio: "2.89701648",
            moneda: "MXN",
          },
        ],
        respuestaCT: {
          pedidoWeb: "PHM-055553",
          estatus: "Pendiente",
        },
      },
    ];

    mockedAxios.get.mockResolvedValue({
      data: mockResponseValue,
    });

    const getCTOrders = await ctOnlineWrapper.orders.get();

    expect(getCTOrders).toEqual(mockResponseValue);
  });

  it("Get order status", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = {
      status: "Facturado",
      folio: "FACT-1982",
    };

    mockedAxios.get.mockResolvedValue({
      data: mockResponseValue,
    });

    const getCTOrderStatus = await ctOnlineWrapper.orders.getStatus(
      "FACT-1982"
    );

    expect(getCTOrderStatus).toEqual(mockResponseValue);
  });

  it("Create Order", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = {
      idPedido: 506398,
      almacen: "01A",
      tipoPago: "04",
      envio: [],
      producto: [
        {
          cantidad: 1,
          clave: "CPUASS020",
          precio: 414.75,
          moneda: "USD",
        },
        {
          cantidad: 1,
          clave: "NBKBIT010",
          precio: 676.5,
          moneda: "MXN",
        },
      ],
      respuestaCT: {
        pedidoWeb: "PHM-055261",
        tipoDeCambio: 21.72,
        estatus: "Pendiente",
        errores: [
          {
            errorCode: 4006,
            errorMessage:
              "Solicitud errónea, el precio enviado del producto con clave: CPUASS020 ($414.75 MXN) no coincide con el precio de Almacén 01A ($414.75 USD).",
            errorReference: "01A",
          },
          {
            errorCode: 4006,
            errorMessage:
              "Solicitud errónea, el precio enviado del producto con clave: NBKBIT010 ($676.5 USD) no coincide con el precio de Almacén 01A ($676.5 MXN).",
            errorReference: "01A",
          },
        ],
      },
    };

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          "01A": {
            existencia: 2774,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          "01A": {
            existencia: 27,
          },
        },
      });

    mockedAxios.post.mockResolvedValueOnce({
      data: mockResponseValue,
    });

    const createOrder = await ctOnlineWrapper.orders.create({
      idPedido: 506398,
      tipoPago: "04",
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

    expect(createOrder).toEqual([mockResponseValue]);
  });

  it("Confirm Order", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = {
      okCode: 2000,
      okMessage: "¡Ok, se procesó satisfactoriamente!",
      okReference: "Se ha confirmado el pedido",
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: mockResponseValue,
    });

    const confirmCTOrder = await ctOnlineWrapper.orders.confirm("PHM-05586");

    expect(confirmCTOrder).toEqual(mockResponseValue);
  });

  it("Send label", async () => {
    const ctOnlineWrapper = new CTOnlineWrapper(apiCredentials, ftpCredentials);
    const mockResponseValue = {
      okCode: 2000,
      okMessage: "¡Ok, se procesó satisfactoriamente!",
      okReference:
        "Guías recibidas, el pedido se encuentra en proceso de envió",
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: mockResponseValue,
    });

    const sendLabelsToCT = await ctOnlineWrapper.orders.sendLabel({
      folio: "PHM-05586",
      guias: [
        {
          guia: "2025806750",
          paqueteria: "FEDEX",
          archivo: "base64String",
        },
        {
          guia: "2025806752",
          paqueteria: "FEDEX",
          archivo: "base64String",
        },
      ],
    });

    expect(sendLabelsToCT).toEqual(mockResponseValue);
  });
});
