import 'dotenv/config';

class EnvironmentConfig {
  constructor() {
    this.validateEnvironment();
  }

  get apiId() {
    return parseInt(process.env.API_ID);
  }

  get apiHash() {
    return process.env.API_HASH;
  }

  get adminChatId() {
    return parseInt(process.env.ADMIN_CHAT_ID);
  }

  get logLevel() {
    return process.env.LOG_LEVEL || 'info';
  }

  validateEnvironment() {
    const requiredVars = ['API_ID', 'API_HASH', 'ADMIN_CHAT_ID'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (isNaN(this.apiId)) {
      throw new Error('API_ID must be a valid number');
    }

    if (isNaN(this.adminChatId)) {
      throw new Error('ADMIN_CHAT_ID must be a valid number');
    }
  }
}

export default new EnvironmentConfig();