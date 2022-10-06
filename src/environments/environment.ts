// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cognito: {
    userPoolId: 'ap-south-1_ukahLIOJC',
    userPoolWebClientId: '209omr8f1cp73i811ipk3pi3q7'
  },
  //pod_port:window.location.hostname,
  pod_port:window.location.hostname+':3000'
  // pod_port:window.location.hostname+'/api'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
