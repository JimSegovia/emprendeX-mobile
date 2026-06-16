import React, { useRef, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { router } from 'expo-router';
import { ArrowRight, Clock, FileText, TrendingUp } from 'lucide-react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated, {
  AnimatedTouchableOpacity,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';

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
    detail: 'Menos pasos manuales y más foco en resolver rápido lo importante de tu día.',
    icon: Clock,
  },
  {
    id: 'crece',
    title: 'Haz crecer tu negocio',
    description: 'Toma mejores decisiones.',
    detail: 'Ten una vista más clara de tu operación para detectar oportunidades con facilidad.',
    icon: TrendingUp,
  },
];

export default function OnboardingStep1() {
  const { palette } = useAccountPreferences();
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
    <AppSafeArea className="flex-1 bg-white pt-12">
      <Animated.View className="flex-1 justify-between pb-8" entering={screenEntering}>
        <View className="px-6">
          <Animated.View className="items-center mt-12 mb-8" entering={sectionEntering(0)}>
            <Text className="text-2xl font-semibold text-slate-800 text-center mb-4 px-4 leading-tight">
              Todo lo que tu <Text style={{ color: palette.primaryText }}>negocio</Text> necesita
            </Text>
            <Text className="text-slate-500 text-center text-base px-2 leading-relaxed">
              Gestiona pedidos, clientes, productos, contabilidad y más. Desde cualquier lugar.
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
                  <Animated.View
                    className="rounded-[28px] border border-slate-100 bg-white px-5 py-6 shadow-sm shadow-slate-100"
                    layout={smoothLayout}
                  >
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="p-3 rounded-2xl" style={{ backgroundColor: palette.primarySoft }}>
                        <Icon size={24} color={palette.primary} />
                      </View>

                      <View className="rounded-full bg-slate-100 px-3 py-1.5">
                        <Text className="text-xs font-semibold text-slate-500">
                          {index + 1} de {FEATURE_SLIDES.length}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-slate-800 font-semibold text-xl leading-tight">
                      {item.title}
                    </Text>
                    <Text className="mt-3 text-slate-500 text-base leading-6">
                      {item.description}
                    </Text>

                    <View className="mt-6 rounded-2xl px-4 py-4 border" style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}>
                      <Text className="text-sm leading-6" style={{ color: palette.primaryText }}>{item.detail}</Text>
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
                  className={`h-2 rounded-full ${isActive ? 'w-6' : 'w-2'} ${index === FEATURE_SLIDES.length - 1 ? '' : 'mr-2'}`}
                  style={{ backgroundColor: isActive ? palette.primary : '#e2e8f0' }}
                  onPress={() => goToSlide(index)}
                  layout={smoothLayout}
                />
              );
            })}
          </View>

          <AnimatedTouchableOpacity
            className="w-full rounded-xl py-4 items-center justify-center flex-row"
            style={{ backgroundColor: palette.primary }}
            onPress={handleNext}
            layout={smoothLayout}
          >
            <Text className="text-white font-semibold text-lg mr-2">
              {isLastSlide ? 'Comenzar' : 'Siguiente'}
            </Text>
            {!isLastSlide && <ArrowRight size={20} color="white" />}
          </AnimatedTouchableOpacity>
        </Animated.View>
      </Animated.View>
    </AppSafeArea>
  );
}
