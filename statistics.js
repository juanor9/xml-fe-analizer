import * as fs from "fs";
import * as xml2js from "xml2js";

const path = "./xml-billing"; // Ruta de la carpeta que contiene los archivos XML

const getFeData = async () => {
  const files = await fs.promises.readdir(path);

  const filesDataArray = await Promise.all(
    files.map(async (file) => {
      const filePath = `${path}/${file}`;
      const extension = file.split(".")[1];

      if (extension !== "xml") {
        return;
      }

      const content = await fs.promises.readFile(filePath, "utf-8");
      const result = await new Promise((resolve, reject) => {
        xml2js.parseString(content, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Realizar búsquedas en las etiquetas específicas
      const FeId = result.AttachedDocument["cbc:ParentDocumentID"][0];
      const FeDataDescription =
        result.AttachedDocument["cac:Attachment"][0][
          "cac:ExternalReference"
        ][0]["cbc:Description"][0];

      const FeDataDescriptionResult = await new Promise((resolve, reject) => {
        const parser = new xml2js.Parser();
        parser.parseString(FeDataDescription, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Buyer Data
      const buyerXml =
        FeDataDescriptionResult.Invoice["cac:AccountingCustomerParty"][0][
          "cac:Party"
        ][0]["cac:PartyTaxScheme"][0];
      const buyerName = buyerXml["cbc:RegistrationName"][0];
      const buyerId = buyerXml["cbc:CompanyID"][0]["_"];
      const buyer = {
        name: buyerName,
        id: buyerId,
      };

      // Items;
      const itemXml = FeDataDescriptionResult.Invoice["cac:InvoiceLine"];

      const itemsArr = itemXml.map((item) => {
        const ammount = Number(item["cbc:InvoicedQuantity"][0]["_"]);
        const bookName = item["cac:Item"][0]["cbc:Description"][0];
        const code =
          item["cac:Item"][0]["cac:StandardItemIdentification"][0]["cbc:ID"][0][
            "_"
          ];
        const unitPrice = Number(
          item["cac:Price"][0]["cbc:PriceAmount"][0]["_"]
        );

        const itemData = {
          FeId: FeId,
          buyer: buyer,
          ammount: ammount,
          name: bookName,
          code: code,
          unitPrice: unitPrice,
          totalPrice: unitPrice * ammount,
        };
        return itemData;
      });

      return itemsArr;
    })
  );
  // console.log("🚀 ~ file: statistics.js:88 ~ getFeData ~ filesDataArray:", filesDataArray)
  let filesData = filesDataArray.flat();
  filesData = filesData.filter((element) => element !== undefined);
  // console.log("🚀 ~ file: statistics.js:91 ~ getFeData ~ filesData:", filesData)

  if (filesData.length < 1) {
    return "No hay archivos xml para analizar";
  }

  const result = {};
  const dataInfo = filesData.map((item) => {
    const { code, name, ammount, totalPrice } = item;
    if (!result[code]) {
      // Si el código no existe en el objeto result, se crea una nueva entrada con las sumas iniciales
      result[code] = {
        name: name,
        ammount: ammount,
        billed: totalPrice,
      };
    } else {
      // Si el código ya existe en el objeto result, se actualizan las sumas
      result[code].ammount += ammount;
      result[code].billed += totalPrice;
    }
  });
  console.log(result);
  // console.log("🚀 ~ file: statistics.js:111 ~ dataInfo ~ dataInfo:", dataInfo)
};

getFeData();
