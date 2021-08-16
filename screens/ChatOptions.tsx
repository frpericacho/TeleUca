import React from 'react';
import { View, Text } from 'react-native';

const ChatOptions = ({route,navigation}:any) => {
    

    if(route.params.Admin){
        return(
            <View>
                <Text>
                    soy Admin
                </Text>
            </View>
        )
    }else{
        return(
            <View>
                <Text>
                    Pues no soy Admin
                </Text>
            </View>
        )
    }
}

export default ChatOptions;