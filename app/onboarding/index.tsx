import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FileText, Clock, TrendingUp } from 'lucide-react-native';

export default function OnboardingStep1() {
  const handleNext = () => {
    router.push('/onboarding/modules');
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <View className="flex-1 px-6 justify-between pb-8">
        
        {/* Header Content */}
        <View className="items-center mt-12 mb-8">
          <Text className="text-3xl font-extrabold text-slate-800 text-center mb-4 px-4 leading-tight">
            Todo lo que tu <Text className="text-violet-600">negocio</Text> necesita
          </Text>
          <Text className="text-slate-500 text-center text-base px-2 leading-relaxed">
            Gestiona pedidos, clientes, productos, pagos y más. Desde cualquier lugar.
          </Text>
        </View>

        {/* Features List */}
        <View className="space-y-4 mb-auto">
          {/* Feature 1 */}
          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100">
            <View className="bg-violet-100 p-3 rounded-xl mr-4">
              <FileText size={24} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg mb-1">Organiza tu negocio</Text>
              <Text className="text-slate-500 text-sm">Centraliza toda tu información.</Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100">
            <View className="bg-violet-100 p-3 rounded-xl mr-4">
              <Clock size={24} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg mb-1">Ahorra tiempo</Text>
              <Text className="text-slate-500 text-sm">Automatiza y simplifica procesos.</Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100">
            <View className="bg-violet-100 p-3 rounded-xl mr-4">
              <TrendingUp size={24} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg mb-1">Haz crecer tu negocio</Text>
              <Text className="text-slate-500 text-sm">Toma mejores decisiones.</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center w-full mt-8">
          {/* Pagination Dots */}
          <View className="flex-row items-center justify-center space-x-2 mb-8">
            <View className="h-2 w-6 bg-violet-600 rounded-full" />
            <View className="h-2 w-2 bg-slate-200 rounded-full" />
            <View className="h-2 w-2 bg-slate-200 rounded-full" />
          </View>

          {/* Button */}
          <TouchableOpacity 
            className="w-full bg-violet-600 rounded-xl py-4 items-center justify-center active:bg-violet-700"
            onPress={handleNext}
          >
            <Text className="text-white font-bold text-lg">Comenzar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
