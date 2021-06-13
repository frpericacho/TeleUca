import { Text, View, SafeAreaView, FlatList } from "react-native";
import React, { useState } from 'react';
import { Button } from "react-native-elements";
import { supabase } from "../lib/SupabaseSetUp"
import ChatItem from '../components/chatItem';
import { useEffect } from "react";
import Chat from '../lib/Types/Chat'

export default function Home({navigation}:any) {
  const [chats, setChats] = useState<Array<Chat>>([])

  const Saved:Chat ={
    id: '0',
    title: 'string',
    user_id: 1,
    description: 'string',
    avatar_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU',
  }
  
  const Item = ({ item }:any) => (
    <ChatItem navigation={navigation} Chat={item} />
  );

  useEffect(()=>{
    fetchChat();
  },[])
  
  const fetchChat = async () => {
    const { data: chats, error } = await supabase
      .from<Chat>('chats')
      .select('*')
      .order('id', { ascending: false })
    if (error) console.log('error', error)
    else setChats(chats!)
  }

  const renderItem = ({ item }:any) => (
    <Item item={item} />
  );

  return(
    <View>
      <ChatItem navigation={navigation} Chat={Saved} />
      <FlatList
        style={{marginTop:1}}
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};