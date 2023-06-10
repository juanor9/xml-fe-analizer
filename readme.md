# Analizador de XML de Facturas Electrónicas

Este repositorio contiene un script de Node.js para analizar archivos XML y generar estadísticas de facturas electrónicas. Se utilizan las etiquetas estandarizadas por la DIAN (Dirección de Impuestos y Aduanas Nacionales de Colombia), pero es posible que pueda aplicarse a archivos xml generados por entidades de otros países.

## Requisitos

- Node.js instalado en tu sistema.

## Instalación

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/juanor9/xml-fe-analizer.git
   ```
2. Navega al directorio del repositorio:

    ```bash
    cd xml-fe-analizer
    ```
3. Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

## Uso
1. Asegúrate de tener los archivos XML que deseas analizar en la carpeta `xml-billing`.

2. Ejecuta el siguiente comando para iniciar el análisis de los archivos XML:

    ```bash
        npm start
    ```
3. El script procesará los archivos XML y generará estadísticas basadas en la información de las facturas electrónicas.

4. Los resultados del análisis se mostrarán en la consola con el siguiente formato:
    ```bash
    {
    'identificador del producto vendido': { 
      name: 'nombre del producto', 
      ammount: 'cantidades ventidas', 
      billed: 'total facturado' }
    }
    ```
## Contribución
Si deseas contribuir a este proyecto, siéntete libre de hacer un fork y enviar tus pull requests.