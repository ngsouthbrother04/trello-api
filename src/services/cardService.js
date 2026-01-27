/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createCard = async (req) => {
  try {
    const card = {
      ...req
    }

    const createdCard = await cardModel.createCard(card)

    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      await columnModel.pushCardIdToColumn(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Fail to create new card')
  }
}

const updateCard = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    // Cập nhật ảnh nếu có file được gửi lên
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'trello/cardCovers', cardId)
      updateData.cover = uploadResult.secure_url

      updatedCard = await cardModel.updateCard(cardId, updateData)
    } else if (updateData.commentToAdd) {
      //Tạo dữ liệu comment thêm vào DB
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incommingMemberInfo) {
      //Xử lý thêm, xoá thành viên vào card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incommingMemberInfo)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createCard,
  updateCard
}