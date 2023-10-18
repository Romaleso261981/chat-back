// import { Rooms } from '../models/rooms.js'
import { ChatModel } from '../models/ChatModel.js'
import { Message } from '../models/Message.js'
import { User } from '../models/user.js'

export default async function (io) {
	let activeUsers = []

	io.on('connection', socket => {
		socket.on('new-user-add', async user_id => {
			if (!activeUsers.some(user => user.userId === user_id)) {
				activeUsers.push({ userId: user_id, socketId: socket.id })
			}
			console.log('User Connected', activeUsers)
			io.emit('get-users', activeUsers)
		})
		socket.on('get-curent-chatRoom', async (chat_id, userId) => {
			try {
				const chatRoom = await ChatModel.findOne({ id: chat_id })
				if (!chatRoom) {
					const newChatRoom = new ChatModel({
						id: chat_id,
						members: [],
						messages: [],
					})
					await newChatRoom.save()
					// const populatedChatRoom = await chatRoom.populate({
					// 	path: 'messages',
					// 	populate: {
					// 		path: 'user',
					// 	},
					// })
					io.emit('get-chatRoom', newChatRoom)
				} else {
					// const populatedChatRoom = await chatRoom.populate({
					// 	path: 'messages',
					// 	populate: {
					// 		path: 'user',
					// 	},
					// })
					io.emit('get-chatRoom', chatRoom)
				}
			} catch (error) {
				console.error('Error get-curent-chatRoom:', error)
			}
		})
		socket.on('send-message', async ({ text, senderId, chatId }) => {
			try {
				const chatRoom = await ChatModel.findOne({ id: chatId })

				const user = await User.findById(senderId)
				const newMessage = new Message({ text, user, chatId, createdAt: new Date() })
				await newMessage.save()

				if (chatRoom.messages) {
					chatRoom.messages.push(newMessage)
					await chatRoom.save()
				} else {
					chatRoom.messages = [newMessage]
					await chatRoom.save()
				}
				const updatedChatRoom = await ChatModel.findOne({ id: chatId }).populate({
					path: 'messages',
					populate: {
						path: 'user',
					},
				})

				console.log('updatedChatRoom.messages:', updatedChatRoom.messages[updatedChatRoom.messages.length - 1])

				io.emit('receive-message', updatedChatRoom.messages[updatedChatRoom.messages.length - 1])
			} catch (error) {
				console.error("Error get-curent-chatRoom:", error)
			}
		})
		socket.on('disconnect', async () => {
			activeUsers = activeUsers.filter(user => user.socketId !== socket.id)
			console.log('User Disconnected', activeUsers)
			io.emit('get-users', activeUsers)
		})
	})
}
