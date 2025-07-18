# Telegram Keyword Parser

A structured Telegram bot that monitors specified chats for keyword matches and forwards relevant messages to an admin forum.

## 🏗️ Project Structure

```
src/
├── index.js              # Main entry point
├── TelegramBot.js         # Main bot orchestrator
├── config/
│   ├── constants.js       # Application constants
│   └── environment.js     # Environment variables configuration
├── models/
│   └── KeywordMapping.js  # Keyword mapping model
├── services/
│   ├── ChatService.js     # Chat management operations
│   ├── KeywordService.js  # Keyword parsing and matching
│   └── MessageService.js  # Message processing and forwarding
├── handlers/
│   ├── CommandHandler.js  # Admin command processing
│   └── MessageHandler.js  # Message event coordination
└── utils/
    ├── helpers.js         # Utility functions
    ├── Logger.js          # Logging functionality
    └── LimitedContainer.js # Limited capacity container
```

## 🚀 Key Improvements

### 1. **Modular Architecture**
- **Separation of Concerns**: Each class has a single responsibility
- **Service Layer**: Business logic separated into dedicated services
- **Handler Layer**: Event handling separated from business logic
- **Configuration Layer**: Centralized configuration management

### 2. **Enhanced Error Handling**
- Comprehensive try-catch blocks
- Graceful error recovery
- Detailed error logging
- Input validation

### 3. **Better Maintainability**
- Clear module boundaries
- Consistent naming conventions
- Comprehensive logging
- Type safety considerations

### 4. **Improved Testability**
- Dependency injection pattern
- Isolated concerns
- Mockable interfaces
- Clear separation of pure functions

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
ADMIN_CHAT_ID=your_admin_chat_id
LOG_LEVEL=info
```

## 📋 Commands

The bot supports the following admin commands:

- `!чатдобавить <username>` - Add a chat to monitoring
- `!чатудалить <username>` - Remove a chat from monitoring
- `!чатпросмотреть` - View all monitored chats
- `!ключевыеслова` - Update keyword mappings from forum topics
- `!получитьслова` - Display current keyword mappings

## 🏃‍♂️ Running the Application

```bash
# Install dependencies
npm install

# Start the bot
npm start

# Start in background
npm run start:background
```

## 📁 Legacy Code

The original monolithic code has been preserved as `index.old.js` for reference.

## 🔧 Configuration

All configuration is centralized in the `src/config/` directory:

- **constants.js**: Application-wide constants
- **environment.js**: Environment variable validation and access

## 🔍 Logging

The application uses a structured logging system with different log levels:
- `debug`: Detailed debugging information
- `info`: General information
- `warn`: Warning messages
- `error`: Error messages

Set the `LOG_LEVEL` environment variable to control logging verbosity.