import { View, Text, Image } from 'react-native';
import React from 'react';
import icons from '@/constants/icons';

interface ItemProps {
  nombre: string;
}

const Header = ({ nombre }: ItemProps) => {
  return (
    <View className="flex flex-row items-center justify-between px-4 py-2 bg-gray-100 w-full h-10">
      {/* ✅ Ensure the home icon is small */}
      <Image 
        source={icons.home} 
        style={{ width: 16, height: 16, maxWidth: 16, maxHeight: 16 }} 
        resizeMode="contain" 
      />
      
      <Text className="text-lg font-bold">{nombre}</Text>
    </View>
  );
};

export default Header;
