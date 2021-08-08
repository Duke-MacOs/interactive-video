import systemStoreMiddleware from './systemStoreMiddleware';
import nativeStoreMiddleware from './nativeStoreMiddleware';

const customMiddleware = [...systemStoreMiddleware, ...nativeStoreMiddleware];

export default customMiddleware;
