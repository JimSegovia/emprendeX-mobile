import React, { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, Clock, FileText, LucideIcon, TrendingUp } from 'lucide-react-native';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';

type FeatureSlide = {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 'organiza',
    title: 'Organiza tu negocio',
    description: 'Centraliza toda tu información.',
    detail: 'Pedidos, clientes y seguimiento en un mismo lugar para trabajar con mas orden.',
    icon: FileText,
  },
  {
    id: 'ahorra',
    title: 'Ahorra tiempo',
    description: 'Automatiza y simplifica procesos.',
    detail: 'Menos pasos manuales y mas foco en resolver rapido lo importante de tu dia.',
    icon: Clock,
  },
  {
    id: 'crece',
    title: 'Haz crecer tu negocio',
    description: 'Toma mejores decisiones.',
    detail: 'Ten una vista mas clara de tu operacion para detectar oportunidades con facilidad.',
    icon: TrendingUp,
  },
];

export default function OnboardingStep1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<FeatureSlide>>(null);
  const { width } = useWindowDimensions();

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => {
    if (currentIndex === FEATURE_SLIDES.length - 1) {
      router.push('/onboarding/setup');
      return;
    }

    goToSlide(currentIndex + 1);
  };

  const isLastSlide = currentIndex === FEATURE_SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <Animated.View className="flex-1 justify-between pb-8" entering={screenEntering}>
        <View className="px-6">
          <Animated.View className="items-center mt-12 mb-8" entering={sectionEntering(0)}>
            <Text className="text-3xl font-extrabold text-slate-800 text-center mb-4 px-4 leading-tight">
              Todo lo que tu <Text className="text-violet-600">negocio</Text> necesita
            </Text>
            <Text className="text-slate-500 text-center text-base px-2 leading-relaxed">
              Gestiona pedidos, clientes, productos, pagos y más. Desde cualquier lugar.
            </Text>
          </Animated.View>
        </View>

        <Animated.View className="flex-1 justify-center" entering={sectionEntering(1)}>
          <FlatList
            ref={flatListRef}
            data={FEATURE_SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumEnd}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            renderItem={({ item, index }) => {
              const Icon = item.icon;

              return (
                <View style={{ width }} className="px-6">
                  <Animated.View className="rounded-[28px] border border-slate-100 bg-white px-5 py-6 shadow-sm shadow-slate-100" layout={smoothLayout}>
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="bg-violet-100 p-3 rounded-2xl">
                        <Icon size={24} color="#7c3aed" />
                      </View>

                      <View className="rounded-full bg-slate-100 px-3 py-1.5">
                        <Text className="text-xs font-semibold text-slate-500">
                          {index + 1} de {FEATURE_SLIDES.length}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-slate-800 font-bold text-2xl leading-tight">
                      {item.title}
                    </Text>
                    <Text className="mt-3 text-slate-500 text-base leading-6">
                      {item.description}
                    </Text>

                    <View className="mt-6 rounded-2xl bg-violet-50 px-4 py-4 border border-violet-100">
                      <Text className="text-sm leading-6 text-violet-900">{item.detail}</Text>
                    </View>
                  </Animated.View>
                </View>
              );
            }}
          />
        </Animated.View>

        <Animated.View className="items-center w-full mt-8 px-6" entering={sectionEntering(2)}>
          <View className="flex-row items-center justify-center mb-8">
            {FEATURE_SLIDES.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <AnimatedTouchableOpacity
                  key={slide.id}
                  className={`h-2 rounded-full ${isActive ? 'w-6 bg-violet-600' : 'w-2 bg-slate-200'} ${index === FEATURE_SLIDES.length - 1 ? '' : 'mr-2'}`}
                  onPress={() => goToSlide(index)}
                  layout={smoothLayout}
                />
              );
            })}
          </View>

          <AnimatedTouchableOpacity
            className="w-full bg-violet-600 rounded-xl py-4 items-center justify-center active:bg-violet-700 flex-row"
            onPress={handleNext}
            layout={smoothLayout}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {isLastSlide ? 'Comenzar' : 'Siguiente'}
            </Text>
            {!isLastSlide && <ArrowRight size={20} color="white" />}
          </AnimatedTouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
