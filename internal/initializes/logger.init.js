/** @format */
"use strict";

import { Logger } from '../../global/global.js';

const InitLogger = async () => {
  try {
    // Log system startup

  
    
    // Log successful initialization
    Logger.info('Logger system initialized successfully', ['LOGGER_INIT', null, {
      monitoring: true,
      systemInfo: true,
      databaseMonitoring: true
    }]);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize logger system:', error);
    return false;
  }
};

export default InitLogger;