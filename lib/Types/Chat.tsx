type Chat = {
    id: number
    title: string
    user_id: string
    description: string
    avatar_url: string
    LastMessage:{
        _id: string,
        createdAt: any,
        text: string
    }
}

export default Chat;