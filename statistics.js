import * as fs from "fs";
import * as xml2js from "xml2js";

const directorio = "./xml-billing"; // Ruta de la carpeta que contiene los archivos XML

fs.readdir(directorio, (err, archivos) => {
  if (err) {
    console.error("Error al leer la carpeta:", err);
    return;
  }

  archivos.forEach((archivo) => {
    const rutaArchivo = `${directorio}/${archivo}`;

    fs.readFile(rutaArchivo, "utf-8", (err, contenido) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return;
      }

      // Analizar el archivo XML
      xml2js.parseString(contenido, (err, resultado) => {
        if (err) {
          console.error("Error al analizar el archivo XML:", err);
          return;
        }

        // Realizar búsquedas en las etiquetas específicas
        const FeId = resultado.AttachedDocument["cbc:ParentDocumentID"][0];
        const FeDataDescription =
          resultado.AttachedDocument["cac:Attachment"][0]["cac:ExternalReference"][0]["cbc:Description"][0];

        const parser = new xml2js.Parser();
        const FeData = parser.parseString(FeDataDescription, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }
          // Buyer Data
          const buyerXml =
            result.Invoice["cac:AccountingCustomerParty"][0]["cac:Party"][0]["cac:PartyTaxScheme"][0];
          const buyerName = buyerXml["cbc:RegistrationName"][0];
          const buyerId = buyerXml["cbc:CompanyID"][0]["_"];
          const buyer = {
            name: buyerName,
            id: buyerId,
          };

          // Items
          const itemXml = result.Invoice["cac:InvoiceLine"][0];
          const ammount = Number(itemXml["cbc:InvoicedQuantity"][0]["_"]);
          const bookName = itemXml["cac:Item"][0]["cbc:Description"][0];
          const isbn =
            itemXml["cac:Item"][0]["cac:StandardItemIdentification"][0]["cbc:ID"][0]["_"];
          const unitPrice = Number(itemXml["cac:Price"][0]['cbc:PriceAmount'][0]["_"]);

          const item = {
            ammount: ammount,
            name: bookName,
            isbn: isbn,
            unitPrice: unitPrice,
            totalPrice: unitPrice * ammount
          };

          //general object
          const FE = {
            buyer: buyer,
            item: item,
          };

          console.log(FE);
          return FE;
        });

        // Haz lo que necesites con el valor encontrado
        // console.log("Id:", FeId);
        // console.log("Data:", FeDataDescription);
        // console.log('Info:', FeData);
      });
    });
  });
});
