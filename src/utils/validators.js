export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'

export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid (example@domain.com)'

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{8,255}$/
export const PASSWORD_RULE_MESSAGE = 'Password must be 8-255 characters and contain at least 1 letter and 1 number'

export const ALLOW_COMMON_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const LIMIT_COMMON_FILE_TYPE = 10485760