import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof clientesData[0] }) => (
    <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-slate-100 bg-white">
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
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/')} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Clientes</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Search color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Filter color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={clientesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
