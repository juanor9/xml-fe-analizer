import * as fs from "fs";
import * as xml2js from "xml2js";

const path = "./xml-billing"; // Ruta de la carpeta que contiene los archivos XML

const getFeData = async () => {
  const files = await fs.promises.readdir(path); // Leer los archivos de la carpeta

  const filesDataArray = await Promise.all(
    files.map(async (file) => {
      const filePath = `${path}/${file}`;
      const extension = file.split(".")[1];

      if (extension !== "xml") {
        return; // Ignorar archivos que no sean XML
      }

      const content = await fs.promises.readFile(filePath, "utf-8"); // Leer el contenido del archivo
      const result = await new Promise((resolve, reject) => {
        xml2js.parseString(content, (err, result) => { // Analizar el contenido XML
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Obtener el ID del documento y la descripción de los datos adjuntos
      const FeId = result.AttachedDocument["cbc:ParentDocumentID"][0];
      const FeDataDescription =
        result.AttachedDocument["cac:Attachment"][0]["cac:ExternalReference"][0]["cbc:Description"][0];

      const FeDataDescriptionResult = await new Promise((resolve, reject) => {
        const parser = new xml2js.Parser();
        parser.parseString(FeDataDescription, (err, result) => { // Analizar la descripción de los datos adjuntos
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Datos del comprador
      const buyerXml =
        FeDataDescriptionResult.Invoice["cac:AccountingCustomerParty"][0]["cac:Party"][0]["cac:PartyTaxScheme"][0];
      const buyerName = buyerXml["cbc:RegistrationName"][0];
      const buyerId = buyerXml["cbc:CompanyID"][0]["_"];
      const buyer = {
        name: buyerName,
        id: buyerId,
      };

      // Artículos
      const itemXml = FeDataDescriptionResult.Invoice["cac:InvoiceLine"];

      const itemsArr = itemXml.map((item) => {
        const ammount = Number(item["cbc:InvoicedQuantity"][0]["_"]);
        const bookName = item["cac:Item"][0]["cbc:Description"][0];
        const code =
          item["cac:Item"][0]["cac:StandardItemIdentification"][0]["cbc:ID"][0]["_"];
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

      return itemsArr; // Devolver los datos de los artículos
    })
  );
  let filesData = filesDataArray.flat(); // Unificar los datos de los artículos de todos los archivos
  filesData = filesData.filter((element) => element !== undefined); // Eliminar elementos indefinidos

  if (filesData.length < 1) {
    return "No hay archivos xml para analizar"; // No hay archivos XML para procesar
  }

  const result = {};
  const dataInfo = filesData.map((item) => {
    const { code, name, ammount, totalPrice } = item;
    if (!result[code]) {
      result[code] = {
        name: name,
        ammount: ammount,
        billed: totalPrice,
      };
    } else {
      result[code].ammount += ammount;
      result[code].billed += totalPrice;
    }
  });
  console.log(result); // Imprimir en la consola los datos resumidos de los artículos
  return result; // Devolver los datos resumidos de los artículos
};

getFeData();