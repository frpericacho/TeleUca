import User from "./User";

type Message = {
    id: string
    message: string
    user_id: string
    media_url: string
    channel_id: string
    inserted_at: Date
    user: User
}

export default Message;