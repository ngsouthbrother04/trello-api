const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, customSubject, customHtmlContent) => {
  //Khởi tạo sendSmtpMail
  let sendSmtpMail = new SibApiV3Sdk.SendSmtpEmail()

  //Tài khoản gửi email: Phải là email đã được xác thực trong Brevo
  sendSmtpMail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  }

  //Những tài khoản nhận email
  //? Phải sử dụng mảng vì có thể gửi cho nhiều người cùng lúc
  sendSmtpMail.to = [{ email: toEmail }]

  //Tiêu đề email
  sendSmtpMail.subject = customSubject

  //Nội dung email dạng HTML
  sendSmtpMail.htmlContent = customHtmlContent

  //Gọi API Brevo để gửi email
  //? sendTransacEmail trả về một Promise
  return apiInstance.sendTransacEmail(sendSmtpMail)
}

export const BrevoProvider = {
  sendEmail
}
