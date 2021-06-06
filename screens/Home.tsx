import { Text, View } from "react-native";
import React, { useState } from 'react';
import { Button } from "react-native-elements";
import { supabase } from "../lib/SupabaseSetUp"

type Chat = {
  id: number
  title: string
  user_id: number
  description: string
  avatar_url: string
}

export default function Home({navigation}:any) {
  const [chats, setChats] = useState<Array<Chat>>([])
  
  const fetchChat = async () => {
    const { data: chats, error } = await supabase
      .from<Chat>('chats')
      .select('*')
      .order('id', { ascending: false })
    if (error) console.log('error', error)
    else setChats(chats!)
  }

  return(
    <View>
      
    </View>
  );
};