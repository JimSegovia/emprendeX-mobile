export type CatalogItemKind = 'Producto' | 'Servicio';
export type CatalogItemType = 'Simple' | 'Personalizado';

export type CatalogItem = {
  id: string;
  name: string;
  kind: CatalogItemKind;
  type: CatalogItemType;
  price: number;
  currencySymbol: string;
  description: string;
  sku?: string;
  unit?: string;
  isActive: boolean;
};

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'PR-01',
    name: 'Box de cupcakes',
    kind: 'Producto',
    type: 'Simple',
    price: 48,
    currencySymbol: 'S/',
    description: 'Caja cerrada con 6 cupcakes en sabores fijos.',
    sku: 'CUP-BOX-06',
    unit: 'Caja',
    isActive: true,
  },
  {
    id: 'PR-02',
    name: 'Torta personalizada',
    kind: 'Producto',
    type: 'Personalizado',
    price: 150,
    currencySymbol: 'S/',
    description: 'Base editable por tema, porciones y acabados decorativos.',
    sku: 'CAKE-CUSTOM',
    unit: 'Unidad',
    isActive: true,
  },
  {
    id: 'SV-01',
    name: 'Mesa dulce para evento',
    kind: 'Servicio',
    type: 'Personalizado',
    price: 420,
    currencySymbol: 'S/',
    description: 'Incluye montaje, exhibicion y seleccion segun la ocasion.',
    sku: 'SWEET-TABLE',
    unit: 'Evento',
    isActive: true,
  },
  {
    id: 'PR-03',
    name: 'Galletas decoradas (docena)',
    kind: 'Producto',
    type: 'Personalizado',
    price: 72,
    currencySymbol: 'S/',
    description: 'Diseños a pedido con glaseado real y empaques individuales.',
    sku: 'COOKIES-12',
    unit: 'Docena',
    isActive: true,
  },
  {
    id: 'SV-02',
    name: 'Entrega express',
    kind: 'Servicio',
    type: 'Simple',
    price: 18,
    currencySymbol: 'S/',
    description: 'Entrega el mismo dia dentro de zonas seleccionadas.',
    sku: 'DELIVERY-EXP',
    unit: 'Servicio',
    isActive: false,
  },
];

export function formatMoney(currencySymbol: string, value: number) {
  return `${currencySymbol} ${value.toFixed(2)}`;
}
