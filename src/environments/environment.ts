import config from '../../auth_config.json';
import { EnvProperties } from '../app/interfaces';
const { domain, clientId, audience, apiUri } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
};

export const environment: EnvProperties = {
  production: false,
  auth: {
    domain,
    clientId,
    ...(audience && audience !== 'YOUR_API_IDENTIFIER' ? { audience } : null),
    redirectUri: window.location.origin,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`], /*Or /simple/*, only calls to the api endpoint "/simple/" get a bearer attached*/
  },
  api: {
    api: apiUri,
  },
};
