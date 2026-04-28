import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, FileText, Plus, Users, Menu } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function TabLayout() {
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="operaciones"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarIcon: () => (
            <View className="bg-violet-600 w-14 h-14 rounded-full items-center justify-center -mt-6 border-4 border-white shadow-sm shadow-violet-200">
              <Plus size={28} color="white" />
            </View>
          ),
          // Disable default click so we could show a modal or action sheet
          tabBarButton: (props: any) => (
            <TouchableOpacity 
              {...props} 
              activeOpacity={0.8}
              onPress={() => console.log('FAB pressed')} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarIcon: ({ color }) => <Menu size={24} color={color} />,
          tabBarButton: (props: any) => (
             <TouchableOpacity 
              {...props} 
              activeOpacity={0.8}
              onPress={() => {
                 // The "Más" tab opens the drawer menu
                 navigation.dispatch(DrawerActions.openDrawer());
              }} 
            />
          )
        }}
      />
    </Tabs>
  );
}
