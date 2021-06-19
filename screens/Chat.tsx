import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from "../lib/SupabaseSetUp";
import Message from '../lib/Types/Message'
import { MyUser } from '../lib/AuthProvider';

const Chat = ({route}:any) => {
    const [messages, setMessages] = useState<Array<Message>>([]);
    const fetchChat = async () => {
        const { data: messages, error } = await supabase
          .from<Message>('messages')
          .select(`
            *,
            user:user_id (username)
          `)
          .order('id', { ascending: false })
        if (error) console.log('error', error)
        else{
            let mes = messages!.map(function(element){
                return {
                    _id: element.id,
                    text: element.message,
                    createdAt: element.inserted_at,
                    image: element.media_url,
                    user:{
                        //el id del usuario viene undefined
                        _id: element.user.id,
                        name: element.user.username
                    }
                }
            })
            console.log('mes',mes)
            setMessages(mes!)  
        } 
    }

    useEffect(() => {
        fetchChat();
    }, [])

    const onSend = async (newMessages = []) => {
        
        setMessages(GiftedChat.append(messages, newMessages));

        const { data, error } = await supabase
            .from<Message>('messages')
            .insert([
                { message: newMessages[0].text, user_id: route.params.user_id, channel_id: route.params.id},
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
                _id: MyUser.id,
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