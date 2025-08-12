// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/**
 * Variables para configurar la aplicación de manera local.
 * 
 * Usar localhost en API_URL solo si se ejecuta el API de otra forma la IP directo del servidor.
 */
export const environment = {
  production: false,
  constants: {
     API_URL: 'http://10.0.10.121:3000/api',
    //API_URL: 'http://it.manzanillo.gob.mx:3000/api'
    // API_URL: 'http://173.224.122.224:3000/api'
    // API_URL: 'http://localhost:3000/api'
    //API_URL: 'http://173.224.122.224/api'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
