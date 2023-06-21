import config from '../../auth_config.json';
import { EnvProperties } from '../app/interfaces';
const { domain, clientId, audience, apiUri } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
};

/*
Note a number of changes introduced for auth0 v2 api
 */
export const environment: EnvProperties = {
  production: true,
  auth: {
    domain: config.domain,
    clientId: config.clientId,
    authorizationParams: {
      ...(audience && audience !== 'YOUR_API_IDENTIFIER' ? { audience } : null),
      redirect_uri: window.location.origin,
    }
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`], /*Or /simple/*, only calls to the api endpoint "/simple/" get a bearer attached*/
  },
  api: {
    api: apiUri,
  },
};
