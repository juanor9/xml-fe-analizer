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
      const itemXml = FeDataDescriptionResult.Invoice["cac:InvoiceLine"][0];
      const ammount = Number(itemXml["cbc:InvoicedQuantity"][0]["_"]);
      const bookName = itemXml["cac:Item"][0]["cbc:Description"][0];
      const isbn =
        itemXml["cac:Item"][0]["cac:StandardItemIdentification"][0][
          "cbc:ID"
        ][0]["_"];
      const unitPrice = Number(
        itemXml["cac:Price"][0]["cbc:PriceAmount"][0]["_"]
      );

      const item = {
        ammount: ammount,
        name: bookName,
        isbn: isbn,
        unitPrice: unitPrice,
        totalPrice: unitPrice * ammount,
      };

      //general object
      const FE = {
        id: FeId,
        buyer: buyer,
        item: item,
      };
      return FE;
    })
  );
  console.log(
    "🚀 ~ file: statistics.js:93 ~ getFeData ~ filesDataArray:",
    filesDataArray
  );
};

getFeData();
