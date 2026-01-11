import { env } from '~/config/environment'

// Những domain được phép truy cập tài nguyên từ server
export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  'https://trello-api-services.onrender.com'
]

export const BOARD_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT
