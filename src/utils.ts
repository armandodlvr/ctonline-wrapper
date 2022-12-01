import * as fs from "fs";
import * as Client from "ftp";

import type {
  FtpCredentials,
  StandarStock,
  CTProduct,
  StandardizeCatalog,
} from "./types";

export function deleteFile(localPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(localPath)) {
      fs.unlink(localPath, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    }

    resolve();
  });
}

export function downloadFile(
  filename: string,
  localPath: string,
  ftpObject: FtpCredentials
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctFtpClient = new Client();

    ctFtpClient.on("ready", function () {
      ctFtpClient.get(filename, function (err, stream) {
        if (err) {
          return reject(err);
        }

        stream.once("close", function () {
          ctFtpClient.end();
          return resolve();
        });

        stream.pipe(fs.createWriteStream(localPath));
      });
    });

    ctFtpClient.connect(ftpObject);
  });
}

function inStockAndbyWarehouse(ctProduct: CTProduct): {
  inStock: number;
  StockWarehouse: StandarStock[];
} {
  // Not Approved CT Warehouse
  const CTWarehouseRemove = ["TJN", "PAZ", "MXL", "CJS", "ESN", "TAP"];

  //Variables...
  const almacenes = Object.keys(ctProduct.existencia);
  const StockWarehouse = [];

  let inStock = 0;

  for (let i = 0; i < almacenes.length; i++) {
    if (
      ctProduct.existencia[almacenes[i]] > 0 &&
      !CTWarehouseRemove.includes(almacenes[i])
    ) {
      StockWarehouse.push({
        almacen: almacenes[i],
        stock: Number(ctProduct.existencia[almacenes[i]]),
      });
    }
  }

  // inStock re-calc
  if (StockWarehouse.length > 0) {
    inStock = StockWarehouse.map((item) => item.stock).reduce(
      (total, item) => total + item
    );
  }

  return { inStock, StockWarehouse };
}

export async function readJSON(path: string): Promise<StandardizeCatalog[]> {
  try {
    if (fs.existsSync(path)) {
      const ctJSON = fs.readFileSync(path, "utf8");
      const parseCTfile = JSON.parse(ctJSON);

      const standardizeCatalog: StandardizeCatalog[] = [];

      for (const ctProducts of parseCTfile) {
        const { inStock, StockWarehouse } = inStockAndbyWarehouse(ctProducts);

        standardizeCatalog.push({
          code: ctProducts.clave,
          sku: ctProducts.numParte,
          name: ctProducts.nombre,
          model: ctProducts.modelo,
          brand: ctProducts.marca,
          category: ctProducts.categoria,
          subcategory: ctProducts.subcategoria,
          description: ctProducts.descripcion_corta,
          ean: ctProducts.ean,
          upc: ctProducts.upc,
          substitute: ctProducts.sustituto,
          cost: ctProducts.precio,
          inStock,
          byWarehouse: StockWarehouse,
          currency: ctProducts.moneda,
          exchangeRate: ctProducts.tipoCambio,
          specs: ctProducts.especificaciones,
          image: ctProducts.imagen,
        });
      }

      return standardizeCatalog;
    }

    return [];
  } catch (e) {
    return [];
  }
}
