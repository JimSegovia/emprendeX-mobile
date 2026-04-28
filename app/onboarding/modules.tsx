import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Package, 
  Users, 
  Briefcase, 
  Home, 
  RefreshCw, 
  FileText, 
  CreditCard, 
  BarChart2,
  Check
} from 'lucide-react-native';

const MODULES = [
  { id: 'pedidos', title: 'Pedidos', desc: 'Gestiona pedidos y entregas.', icon: Package, defaultChecked: true },
  { id: 'clientes', title: 'Clientes', desc: 'Administra tus clientes.', icon: Users, defaultChecked: true },
  { id: 'productos', title: 'Productos / Servicios', desc: 'Gestiona tu catálogo.', icon: Briefcase, defaultChecked: true },
  { id: 'alquileres', title: 'Alquileres', desc: 'Administra tus alquileres.', icon: Home, defaultChecked: false },
  { id: 'suscripciones', title: 'Suscripciones', desc: 'Gestiona pedidos recurrentes.', icon: RefreshCw, defaultChecked: false },
  { id: 'cotizaciones', title: 'Cotizaciones', desc: 'Crea y envía cotizaciones.', icon: FileText, defaultChecked: true },
  { id: 'pagos', title: 'Pagos', desc: 'Controla pagos y deudas.', icon: CreditCard, defaultChecked: true },
  { id: 'reportes', title: 'Reportes', desc: 'Visualiza tus métricas.', icon: BarChart2, defaultChecked: true },
];

export default function ModulesScreen() {
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(
    MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.defaultChecked }), {})
  );

  const toggleModule = (id: string) => {
    setSelectedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    // Save modules logic here, then navigate to main app
    router.replace('/(drawer)/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center px-4 mb-4">
        <TouchableOpacity 
          className="p-2 rounded-full"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <View className="items-center px-6 mb-6">
        <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
          Elige tus módulos
        </Text>
        <Text className="text-slate-500 text-center text-base">
          Activa los módulos que necesitas. Puedes cambiarlos después.
        </Text>
      </View>

      {/* Modules List */}
      <ScrollView className="flex-1 px-6">
        <View className="border border-slate-100 rounded-3xl overflow-hidden mb-6 bg-white shadow-sm shadow-slate-100">
          {MODULES.map((module, index) => {
            const isSelected = selectedModules[module.id];
            const isLast = index === MODULES.length - 1;
            const Icon = module.icon;

            return (
              <TouchableOpacity
                key={module.id}
                className={`flex-row items-center p-4 bg-white ${!isLast ? 'border-b border-slate-100' : ''}`}
                activeOpacity={0.7}
                onPress={() => toggleModule(module.id)}
              >
                <View className="bg-violet-50 p-2 rounded-xl mr-4">
                  <Icon size={24} color="#7c3aed" />
                </View>
                <View className="flex-1 pr-4">
                  <Text className="text-slate-800 font-bold text-base mb-0.5">{module.title}</Text>
                  <Text className="text-slate-500 text-xs">{module.desc}</Text>
                </View>
                
                {/* Checkbox */}
                <View 
                  className={`w-6 h-6 rounded flex items-center justify-center border ${
                    isSelected ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-slate-300'
                  }`}
                >
                  {isSelected && <Check size={16} color="white" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="p-6 bg-white">
        <TouchableOpacity 
          className="w-full bg-violet-600 rounded-xl py-4 items-center justify-center active:bg-violet-700"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-lg">Guardar y continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
