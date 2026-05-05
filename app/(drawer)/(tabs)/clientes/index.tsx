import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Search, Plus } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, itemEntering, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';

const clientesData = [
  { id: '1', name: 'Maria López', phone: '987 654 321', compras: 12, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Juan Pérez', phone: '912 345 678', compras: 8, avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
  { id: '3', name: 'Lucía Fernández', phone: '946 678 901', compras: 7, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '4', name: 'Carlos Ramírez', phone: '934 567 890', compras: 10, avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: '5', name: 'Ana Torres', phone: '923 456 789', compras: 5, avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { id: '6', name: 'Pedro Gómez', phone: '956 789 123', compras: 3, avatar: 'https://randomuser.me/api/portraits/men/28.jpg' },
];

export default function ClientesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const renderItem = ({ item, index }: { item: typeof clientesData[0]; index: number }) => (
    <AnimatedTouchableOpacity
      className="flex-row items-center justify-between py-5 border-b border-slate-100 bg-white"
      onPress={() => router.push({ pathname: '/(drawer)/(tabs)/clientes/[id]', params: { id: item.id } })}
      entering={itemEntering(index)}
      layout={smoothLayout}
    >
      <View className="flex-row items-center">
        <Image 
          source={{ uri: item.avatar }} 
          className="w-14 h-14 rounded-full mr-4 bg-slate-100"
        />
        <View>
          <Text className="font-bold text-slate-800 text-[15px] mb-0.5">{item.name}</Text>
          <Text className="text-slate-500 text-sm">{item.phone}</Text>
        </View>
      </View>
      <Text className="text-slate-400 text-[13px]">{item.compras} compras</Text>
    </AnimatedTouchableOpacity>
  );

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      {/* Header */}
      <Animated.View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Clientes</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Search color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center rounded-2xl bg-white/15 px-4 py-2.5"
            onPress={() => router.push('/(drawer)/(tabs)/clientes/form')}
          >
            <Plus size={16} color="white" />
            <Text className="ml-2 font-semibold text-white">Nuevo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* List */}
      <FlatList
        data={clientesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
}
