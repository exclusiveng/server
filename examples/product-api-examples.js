const logger = require('winston');

// ...
const data = await response.json();
logger.info('Product created:', { productData: data });
return data;