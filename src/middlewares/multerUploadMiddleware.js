import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_TYPE } from '~/utils/validators'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

//Func kiểm tra loại file được chấp nhận
const fileFilter = (req, file, callback) => {

  //mimetype là định dạng file do browser gửi lên
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is not allowed, only accept jpg, jpeg, png'
    return callback(new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, errMessage), false)
  }

  return callback(null, true)
}

//Khởi tạo multer upload middleware
const upload = multer({
  limits: {
    fileSize: LIMIT_COMMON_FILE_TYPE
  },
  fileFilter: fileFilter
})

export const multerUploadMiddleware = {
  upload
}