import { ApiEnvironment } from './types';

/**
 * A static list of API environments for the Quick Tools section.
 * This data is read-only and configured directly in the code.
 */
export const DEFAULT_API_ENVIRONMENTS: ApiEnvironment[] = [
  {
    id: 'beta1_env',
    name: 'Beta1',
    url: 'https://beta1.ounass.ae/product/findbysku?sku={{sku}}'
  },
  {
    id: 'beta2_env',
    name: 'Beta2',
    url: 'https://beta2.ounass.ae/product/findbysku?sku={{sku}}'
  },
  {
    id: 'preprod_env',
    name: 'Preprod',
    url: 'https://preprod.ounass.ae/product/findbysku?sku={{sku}}'
  }
];
