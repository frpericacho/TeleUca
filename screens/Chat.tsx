import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from "../lib/SupabaseSetUp";
import Message from '../lib/Types/Message'

const Chat = ({route}:any) => {
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [imessages, setIMessages] = useState<Array<IMessage>>([]);
    let MessagesGifted = []
    const fetchChat = async () => {
        const { data: messages, error } = await supabase
          .from<Message>('messages')
          .select('*')
          .order('id', { ascending: false })
        if (error) console.log('error', error)
        else setMessages(messages!)
    }

    useEffect(() => {
        fetchChat();
        messages.forEach(element =>{
            let mess: IMessage[] = [{
                _id: element.id,
                text: element.message,
                createdAt: element.inserted_at,
                user:{
                    _id: element.user_id
                }
            }]
            setIMessages(mess);
        })
        
        /*setMessages([
            {
              _id: 1,
              text: 'Hello developer',
              createdAt: new Date(),
              image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU",
              user: {
                _id: 2,
                name: 'React Native',
                avatar: 'https://placeimg.com/140/140/any',
              },
            },
        ]);*/
    }, [])

    const onSend = async (newMessages = []) => {
        const{
            text,
            user
        } = newMessages[0];

        setMessages(GiftedChat.append(messages, newMessages));

        const { data, error } = await supabase
            .from<Message>('messages')
            .insert([
                { message: text, user_id: route.params.user_id, media_url: 'vacio', channel_id: route.params.id},
            ])

        console.log('messages',messages)
    }

    const rendSend = (props:any) =>{
        return (
            <Send {...props}>
                <View>
                    <Icon name="send-circle" size={35} color="#00bde6" style={{marginBottom:5, marginRight:5}}/>
                </View>
            </Send>
        )
    }

    const rendLoading = () =>{
        return (
            <View style={styles.loadingContainer}>
              <Icon name="loading" size={35} color='#6646ee' />
            </View>
        );
    }

    return(
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            alwaysShowSend
            showAvatarForEveryMessage
            scrollToBottom
            isTyping
            renderLoading={rendLoading}
            renderSend={rendSend}
            user={{
                _id: 1,
            }}
        />
    )
}
export default Chat;

const styles = StyleSheet.create({
    // rest remains same
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });