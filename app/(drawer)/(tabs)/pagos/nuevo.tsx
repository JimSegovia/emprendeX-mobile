import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar as CalendarIcon, CreditCard, Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

const pendingQuotes = [
  {
    id: 'COT-204',
    client: 'Maria López',
    total: 'S/ 320.00',
    balance: 'S/ 320.00',
  },
  {
    id: 'COT-209',
    client: 'Ana Torres',
    total: 'S/ 180.00',
    balance: 'S/ 180.00',
  },
];

const methodOptions = [
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Yape/Plin', value: 'wallet' },
  { label: 'Tarjeta', value: 'tarjeta' },
];

type PaymentType = 'Adelanto' | 'Cancelado';

export default function NuevoPagoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [quote, setQuote] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState(
    pendingQuotes.map((item) => ({
      label: `${item.id} · ${item.client}`,
      value: item.id,
    })),
  );

  const [method, setMethod] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState(methodOptions);

  const [paymentType, setPaymentType] = useState<PaymentType>('Adelanto');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const dropdownSpacing = 220;
  const selectedQuote = pendingQuotes.find((item) => item.id === quote);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) setDate(selectedDate);
  }

  const sanitizedAmount = amount.replace(',', '.');
  const parsedAmount = Number.parseFloat(sanitizedAmount);
  const remainingBalance = selectedQuote
    ? Math.max(0, Number.parseFloat(selectedQuote.balance.replace('S/ ', '')) - (Number.isNaN(parsedAmount) ? 0 : parsedAmount))
    : 0;

  const isFormValid = Boolean(quote && amount.trim().length > 0 && method);

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
        <Text className="text-white text-xl font-bold">Agregar pago</Text>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        entering={sectionEntering(1)}
      >
        <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
          <Text className="text-lg font-extrabold text-slate-800">Cotizacion pendiente</Text>
          <Text className="mt-1 text-sm text-slate-500">Selecciona la cotizacion que sigue con saldo pendiente.</Text>
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
            placeholder="Seleccionar cotizacion"
            listMode="SCROLLVIEW"
            maxHeight={dropdownSpacing}
            zIndex={3000}
            zIndexInverse={1000}
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
            dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
            textStyle={{ color: quote ? '#0f172a' : '#94a3b8' }}
            onOpen={() => {
              setMethodOpen(false);
              setShowDate(false);
            }}
          />
          <View style={{ height: quoteOpen ? dropdownSpacing : 0 }} />

          {selectedQuote ? (
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
          ) : null}
        </View>

        <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
          <Text className="text-lg font-extrabold text-slate-800">Detalle del pago</Text>
          <Text className="mt-1 text-sm text-slate-500">Registra adelanto o cancelacion total.</Text>

          <View className="mt-4">
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
            <Text className="text-sm font-bold text-slate-800 mb-2">Fecha de pago</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white"
              onPress={() => {
                setQuoteOpen(false);
                setMethodOpen(false);
                setShowDate(true);
              }}
            >
              <Text className="text-slate-800">{date.toLocaleDateString()}</Text>
              <CalendarIcon color="#94a3b8" size={20} />
            </TouchableOpacity>
            {showDate ? (
              <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
            ) : null}
          </View>

          <View className="mt-4">
            <Text className="text-sm font-bold text-slate-800 mb-2">Metodo de pago</Text>
            <DropDownPicker
              open={methodOpen}
              value={method}
              items={methodItems}
              setOpen={setMethodOpen}
              setValue={setMethod}
              setItems={setMethodItems}
              placeholder="Seleccionar metodo"
              listMode="SCROLLVIEW"
              maxHeight={dropdownSpacing}
              zIndex={2000}
              zIndexInverse={2000}
              style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
              dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
              textStyle={{ color: method ? '#0f172a' : '#94a3b8' }}
              onOpen={() => {
                setQuoteOpen(false);
                setShowDate(false);
              }}
            />
            <View style={{ height: methodOpen ? dropdownSpacing : 0 }} />
          </View>

          <View className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Tipo</Text>
              <Text className="text-sm font-semibold text-slate-800">{paymentType}</Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Monto</Text>
              <Text className="text-lg font-extrabold text-slate-800">S/ {amount.trim().length > 0 ? amount : '0.00'}</Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Saldo restante</Text>
              <Text className="text-sm font-semibold text-slate-800">S/ {remainingBalance.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

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
            <Text className="text-slate-500 font-medium">Pago a registrar</Text>
            <Text className="text-lg font-bold text-slate-800">S/ {amount.trim().length > 0 ? amount : '0.00'}</Text>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl px-6 py-3 ${isFormValid ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!isFormValid}
          activeOpacity={0.85}
          onPress={() => router.replace('/(drawer)/(tabs)/pagos')}
        >
          <Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>Registrar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
