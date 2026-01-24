/**
 * @param socket : từ socket.io
 */
export const invitationUserToBoardSocket = (socket) => {
  socket.on('FE_USER_INVITTED_TO_BOARD', (data) => {
    //Emit lại sự kiện cho tất cả các client trừ client gửi sự kiện
    socket.broadcast.emit('BE_USER_INVITTED_TO_BOARD', data)
  })
}