/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUserData } from '~/utils/formatter'

const handleBeforeCreateInvitation = async (inviter, invitee, board) => {
  if (!invitee || !board || !inviter) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invitee, board, or inviter not found')
  }

  if (invitee._id.toString() === inviter._id.toString()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot invite yourself')
  }

  //Kiểm tra đã có lời mời chưa, nếu có rồi thì không tạo nữa
  const existingInvitations = await invitationModel.findByUser(invitee._id.toString())
  const hasExistingInvitation = existingInvitations.some(invitation =>
    invitation.type === INVITATION_TYPES.BOARD_INVITATION &&
    invitation.boardInvitation.boardId.toString() === board._id.toString() &&
    invitation.boardInvitation.status === BOARD_INVITATION_STATUS.PENDING
  )

  if (hasExistingInvitation) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'An existing invitation is already pending for this user and board')
  }
}

const createNewBoardInvitation = async (reqBody, inviterId) => {
  const inviter = await userModel.findOneById(inviterId)
  const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
  const board = await boardModel.findOneById(reqBody.boardId)

  await handleBeforeCreateInvitation(inviter, invitee, board)

  const newInvitation = {
    inviterId,
    inviteeId: invitee._id.toString(),
    type: INVITATION_TYPES.BOARD_INVITATION,
    boardInvitation: {
      boardId: board._id.toString(),
      status: BOARD_INVITATION_STATUS.PENDING
    }
  }

  const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitation)
  const responseInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

  return {
    ...responseInvitation,
    board,
    inviter: pickUserData(inviter),
    invitee: pickUserData(invitee)
  }
}

const getInvitations = async (userId) => {
  const invitations = await invitationModel.findByUser(userId)

  return invitations.map(invitation => ({
    ...invitation,
    inviter: invitation.inviter[0] || {},
    invitee: invitation.invitee[0] || {},
    board: invitation.board[0] || {}
  }))
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations
}