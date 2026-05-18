import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, CreditCard, Receipt, PackageMinus, HandCoins } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ItemKind = 'Pago' | 'Gasto';

const kindOptions = [
  { label: 'Ingreso por Pago', value: 'Pago' },
  { label: 'Salida por Gasto', value: 'Gasto' },
];

const pendingQuotes = [
  { id: 'PED-1025', client: 'Lucía Fernández', total: 'S/ 320.00', balance: 'S/ 320.00' },
  { id: 'PED-1029', client: 'Ana Torres', total: 'S/ 180.00', balance: 'S/ 180.00' },
];

const methodOptions = [
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Yape/Plin', value: 'wallet' },
  { label: 'Tarjeta', value: 'tarjeta' },
];

const categoryOptions = [
  { label: 'Suministros / Inventario', value: 'suministros' },
  { label: 'Logística / Envíos', value: 'logistica' },
  { label: 'Marketing / Publicidad', value: 'marketing' },
  { label: 'Servicios Básicos', value: 'servicios' },
  { label: 'Otros', value: 'otros' },
];

type PaymentType = 'Adelanto' | 'Cancelado';

export default function NuevoRegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tipo } = useLocalSearchParams<{ tipo?: 'pago' | 'gasto' }>();

  const [kind, setKind] = useState<ItemKind>(tipo === 'gasto' ? 'Gasto' : 'Pago');
  const [kindOpen, setKindOpen] = useState(false);
  const [kindItems, setKindItems] = useState(kindOptions);

  // Common Fields
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState(methodOptions);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  // Pago Fields
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState(
    pendingQuotes.map((item) => ({ label: `${item.id} · ${item.client}`, value: item.id }))
  );
  const [paymentType, setPaymentType] = useState<PaymentType>('Adelanto');

  // Gasto Fields
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState(categoryOptions);
  const [nota, setNota] = useState('');

  const dropdownSpacing = 220;

  useEffect(() => {
    if (tipo === 'gasto') setKind('Gasto');
    else if (tipo === 'pago') setKind('Pago');
  }, [tipo]);

  const selectedKindMeta = useMemo(() => {
    const isGasto = kind === 'Gasto';
    return {
      label: kind,
      accent: isGasto ? '#e11d48' : '#10b981', // rose-600 : emerald-500
      chipBg: isGasto ? 'bg-rose-50' : 'bg-emerald-50',
      chipText: isGasto ? 'text-rose-700' : 'text-emerald-700',
      iconBg: isGasto ? 'bg-rose-50' : 'bg-emerald-50',
      Icon: isGasto ? PackageMinus : HandCoins,
      hint: isGasto
        ? 'Registra salidas de dinero y categoriza tus gastos.'
        : 'Registra ingresos por pagos o adelantos de pedidos.',
    };
  }, [kind]);

  const isPago = kind === 'Pago';

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) setDate(selectedDate);
  }

  const selectedQuote = pendingQuotes.find((item) => item.id === quote);
  const sanitizedAmount = amount.replace(',', '.');
  const parsedAmount = Number.parseFloat(sanitizedAmount);
  
  const remainingBalance = selectedQuote
    ? Math.max(0, Number.parseFloat(selectedQuote.balance.replace('S/ ', '')) - (Number.isNaN(parsedAmount) ? 0 : parsedAmount))
    : 0;

  const isFormValid = isPago 
    ? Boolean(quote && amount.trim().length > 0 && method)
    : Boolean(category && amount.trim().length > 0 && method);

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nuevo registro</Text>
      </Animated.View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          entering={sectionEntering(1)}
        >
          {/* Tipo de Registro */}
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: kindOpen ? 50 : 1 }}>
            <Text className="text-lg font-extrabold text-slate-800">Tipo de registro</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Selecciona el tipo de movimiento financiero.
            </Text>

            <View className="mt-4">
              <DropDownPicker
                open={kindOpen}
                value={kind}
                items={kindItems}
                setOpen={setKindOpen}
                setValue={setKind}
                setItems={setKindItems}
                placeholder="Seleccionar tipo"
                listMode="SCROLLVIEW"
                maxHeight={dropdownSpacing}
                zIndex={3000}
                zIndexInverse={1000}
                style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                textStyle={{ color: kind ? '#0f172a' : '#94a3b8', fontWeight: '500' }}
                onOpen={() => {
                  setQuoteOpen(false);
                  setMethodOpen(false);
                  setCategoryOpen(false);
                  setShowDate(false);
                }}
              />
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <View className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${selectedKindMeta.iconBg}`}>
                <selectedKindMeta.Icon size={20} color={selectedKindMeta.accent} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className={`rounded-full px-3 py-1.5 ${selectedKindMeta.chipBg}`}>
                    <Text className={`text-xs font-semibold ${selectedKindMeta.chipText}`}>
                      {selectedKindMeta.label}
                    </Text>
                  </View>
                  <Text className="ml-2 text-xs font-semibold text-slate-400">Seleccionado</Text>
                </View>
                <Text className="mt-1 text-xs text-slate-500">{selectedKindMeta.hint}</Text>
              </View>
            </View>
          </View>

          {/* Formulario Específico */}
          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: (quoteOpen || categoryOpen) ? 40 : 1 }}>
            
            {isPago ? (
              <>
                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-lg font-extrabold text-slate-800">Pedido pendiente</Text>
                    <Text className="mt-1 text-sm text-slate-500">Selecciona el pedido a cobrar.</Text>
                  </View>
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
                    <Receipt size={20} color="#7c3aed" />
                  </View>
                </View>

                <DropDownPicker
                  open={quoteOpen}
                  value={quote}
                  items={quoteItems}
                  setOpen={setQuoteOpen}
                  setValue={setQuote}
                  setItems={setQuoteItems}
                  placeholder="Seleccionar pedido"
                  listMode="SCROLLVIEW"
                  maxHeight={dropdownSpacing}
                  zIndex={2000}
                  zIndexInverse={2000}
                  style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                  dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                  textStyle={{ color: quote ? '#0f172a' : '#94a3b8' }}
                  onOpen={() => { setKindOpen(false); setMethodOpen(false); setShowDate(false); }}
                />

                {selectedQuote && (
                  <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500">Cliente</Text>
                      <Text className="font-semibold text-slate-800">{selectedQuote.client}</Text>
                    </View>
                    <View className="mt-3 flex-row justify-between">
                      <Text className="text-sm text-slate-500">Total</Text>
                      <Text className="font-semibold text-slate-800">{selectedQuote.total}</Text>
                    </View>
                    <View className="mt-3 flex-row justify-between">
                      <Text className="text-sm text-slate-500">Saldo pendiente</Text>
                      <Text className="font-semibold text-slate-800">{selectedQuote.balance}</Text>
                    </View>
                  </View>
                )}

                <View className="mt-5">
                  <Text className="text-sm font-bold text-slate-800 mb-2">Tipo de pago</Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className={`mr-3 flex-1 items-center rounded-2xl border px-4 py-3 ${paymentType === 'Adelanto' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}
                      activeOpacity={0.85}
                      onPress={() => setPaymentType('Adelanto')}
                    >
                      <Text className={`font-semibold ${paymentType === 'Adelanto' ? 'text-amber-700' : 'text-slate-600'}`}>Adelanto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 items-center rounded-2xl border px-4 py-3 ${paymentType === 'Cancelado' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                      activeOpacity={0.85}
                      onPress={() => setPaymentType('Cancelado')}
                    >
                      <Text className={`font-semibold ${paymentType === 'Cancelado' ? 'text-emerald-700' : 'text-slate-600'}`}>Cancelado</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View className="mb-4">
                  <Text className="text-lg font-extrabold text-slate-800">Detalles del gasto</Text>
                  <Text className="mt-1 text-sm text-slate-500">Categoriza la salida de dinero.</Text>
                </View>

                <View className="mt-2">
                  <Text className="text-sm font-bold text-slate-800 mb-2">Categoría</Text>
                  <DropDownPicker
                    open={categoryOpen}
                    value={category}
                    items={categoryItems}
                    setOpen={setCategoryOpen}
                    setValue={setCategory}
                    setItems={setCategoryItems}
                    placeholder="Seleccionar categoría"
                    listMode="SCROLLVIEW"
                    maxHeight={dropdownSpacing}
                    zIndex={2000}
                    zIndexInverse={2000}
                    style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                    dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                    textStyle={{ color: category ? '#0f172a' : '#94a3b8' }}
                    onOpen={() => { setKindOpen(false); setMethodOpen(false); setShowDate(false); }}
                  />
                </View>

                <View className="mt-4">
                  <Text className="text-sm font-bold text-slate-800 mb-2">Descripción (opcional)</Text>
                  <TextInput
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800"
                    placeholder="Ej. Compra de empaques"
                    placeholderTextColor="#94a3b8"
                    value={nota}
                    onChangeText={setNota}
                  />
                </View>
              </>
            )}

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Monto</Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <Text className="text-base font-semibold text-slate-500">S/</Text>
                <TextInput
                  className="ml-2 flex-1 text-base font-semibold text-slate-800"
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Fecha</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white"
                onPress={() => {
                  setKindOpen(false); setQuoteOpen(false); setCategoryOpen(false); setMethodOpen(false); setShowDate(true);
                }}
              >
                <Text className="text-slate-800">{date.toLocaleDateString()}</Text>
                <CalendarIcon color="#94a3b8" size={20} />
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
              )}
            </View>
          </View>

          {/* Método de pago general */}
          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: methodOpen ? 30 : 1 }}>
            <Text className="text-sm font-bold text-slate-800 mb-2">Método de {isPago ? 'cobro' : 'pago'}</Text>
            <DropDownPicker
              open={methodOpen}
              value={method}
              items={methodItems}
              setOpen={setMethodOpen}
              setValue={setMethod}
              setItems={setMethodItems}
              placeholder="Seleccionar método"
              listMode="SCROLLVIEW"
              maxHeight={dropdownSpacing}
              zIndex={1000}
              zIndexInverse={3000}
              style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
              dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
              textStyle={{ color: method ? '#0f172a' : '#94a3b8' }}
              onOpen={() => { setKindOpen(false); setQuoteOpen(false); setCategoryOpen(false); setShowDate(false); }}
            />
          </View>

          {/* Resumen */}
          <View className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Operación</Text>
              <Text className="text-sm font-semibold text-slate-800">{isPago ? paymentType : 'Gasto'}</Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Monto</Text>
              <Text className={`text-lg font-extrabold ${isPago ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPago ? '+' : '-'} S/ {amount.trim().length > 0 ? amount : '0.00'}
              </Text>
            </View>
            {isPago && (
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Saldo restante</Text>
                <Text className="text-sm font-semibold text-slate-800">S/ {remainingBalance.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Animated.View
        className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        entering={sectionEntering(2)}
      >
        <View className="flex-row items-center">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
            <CreditCard size={20} color="#7c3aed" />
          </View>
          <View>
            <Text className="text-slate-500 font-medium">{isPago ? 'Cobro' : 'Gasto'} a registrar</Text>
            <Text className="text-lg font-bold text-slate-800">
              S/ {amount.trim().length > 0 ? amount : '0.00'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl px-6 py-3 ${isFormValid ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!isFormValid}
          activeOpacity={0.85}
          onPress={() => router.replace('/(drawer)/(tabs)/contabilidad' as any)}
        >
          <Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>Registrar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
