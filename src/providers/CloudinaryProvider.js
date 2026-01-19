import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

//Cấu hình cloudinary v2 (version 2)
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

//Function thực hiện upload file lên cloudinary
const streamUpload = (fileBuffer, folderName, userId) => {
  return new Promise((resolve, reject) => {
    //Tạo luồng upload stream lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream({
      folder: folderName,
      public_id: `user_${userId}`,
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 200, height: 200, crop: 'fill', gravity: 'face' }
      ]
    },
    (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })

    //Thực hiện upload file bằng streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = {
  streamUpload
}