# Visor Manzanillo

Este proyecto fue generado para el proyecto Visor Manzanillo, está generado con [Node.js](https://nodejs.org/es/) en su versión 16.13.0 por medio de [Angular CLI](https://github.com/angular/angular-cli) versión 13.0.2.

## Ejecución de forma local para desarrollo

Si es la primera vez que se ejecuta, primero hay que instalar las dependencias del proyecto con el comando `npm install`.
Una vez que ya se tienen las dependencias instaladas se ejecuta con el comando `ng serve` y una vez compile el proyecto puede observarse desde el navegador de preferencia por medio de `http://localhost:4200/`. 
La aplicación ser refresca automáticamente al hacer cualquier cambio en sus archivos fuente.

## Escalar código y agregar nuevos módulos

Para generar nuevos módulos se usa el siguiente comando `ng generate component nombre-componente` el cual nos genera un nuevo componente. Sin embargo también es posible usar otros tipos `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Construir compilación

Para construir el proyecto usamos el comando `npx ng build --prod --configuration=production`. Despues de su ejecución se generara lo necesario en la carpeta `dist/`. Si se desea poner en alguna ruta especifica del servidor hay que usar el parámetro base `npx ng build --prod --configuration=production --base-href=/manzanillo/`.
Este proyecto se localiza en la ruta `/var/www/visor/manzanillo` del servidor 163.172.172.120

## Detalles de ayuda

Para más ayuda sobre Angular CLI usa el comando `ng help` o ve a la página de [Angular CLI](https://github.com/angular/angular-cli/blob/master/README.md).

## Otra documentación

- [Documentación API](http://163.172.172.120/docapi)
