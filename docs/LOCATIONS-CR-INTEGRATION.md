# Integración de Ubicaciones de Costa Rica

**Fecha:** 2025-11-20
**Estado:** ✅ Completado

## Descripción

Feature modular y reutilizable para selección de ubicaciones geográficas de Costa Rica (Provincia → Cantón → Distrito). Integrado con el backend Laravel que valida las ubicaciones contra la base de datos de `cr_locations`.

---

## 🎯 Objetivo

Crear una solución **reutilizable** para selección de ubicaciones que pueda usarse en:
- ✅ Formularios de direcciones (clientes)
- ✅ Formularios de envío (carrito/checkout)
- ✅ Cualquier flujo que requiera ubicaciones CR

---

## 📦 Estructura de la Feature

```
features/locations-cr/
├── components/
│   ├── LocationSelector.tsx    # Componente reutilizable
│   └── index.ts
├── hooks/
│   ├── useCrLocations.ts       # Hook reutilizable
│   └── index.ts
├── services/
│   ├── locations.service.ts    # API integration
│   └── index.ts
├── types/
│   ├── locations.types.ts      # TypeScript types
│   └── index.ts
└── index.ts                    # Barrel export
```

---

## 🔌 Backend Integration

### Endpoint

```
GET /api/v1/locations/cr
```

**Características:**
- ✅ **Público** - No requiere autenticación
- ✅ **Cacheado** - Backend cachea por 24 horas
- ✅ **Jerárquico** - Retorna estructura completa

**Respuesta:**
```json
{
  "provincias": [
    {
      "id": 1,
      "nombre": "San José",
      "cantones": [
        {
          "id": 1,
          "nombre": "Central",
          "distritos": [
            {
              "id": 1,
              "nombre": "Carmen"
            },
            {
              "id": 2,
              "nombre": "Merced"
            }
          ]
        }
      ]
    }
  ],
  "total_provincias": 7
}
```

---

## 🛠️ Componentes

### 1. **locationsService**

**Archivo:** [src/features/locations-cr/services/locations.service.ts](../src/features/locations-cr/services/locations.service.ts)

**Funciones:**

```typescript
// Obtener todas las ubicaciones (con cache)
locationsService.getCrLocations(): Promise<CrProvince[]>

// Obtener solo provincias
locationsService.getProvinces(): Promise<CrProvince[]>

// Obtener cantones de una provincia
locationsService.getCantones(provinceName: string): Promise<CrCanton[]>

// Obtener distritos de un cantón
locationsService.getDistritos(provinceName: string, cantonName: string): Promise<CrDistrict[]>

// Validar combinación de ubicación
locationsService.validateLocation(
  provinceName: string,
  cantonName: string,
  distritoName: string
): Promise<boolean>

// Limpiar cache (testing)
locationsService.clearCache(): void
```

**Características:**
- ✅ **In-memory cache** - Evita llamadas repetidas al API
- ✅ **Backend cache** - Laravel cachea por 24 horas
- ✅ **Type-safe** - TypeScript completo
- ✅ **Error handling** - Manejo robusto de errores

---

### 2. **useCrLocations Hook**

**Archivo:** [src/features/locations-cr/hooks/useCrLocations.ts](../src/features/locations-cr/hooks/useCrLocations.ts)

**Uso:**

```typescript
import { useCrLocations } from '@/features/locations-cr';

const MyComponent = () => {
  const {
    provinces,        // CrProvince[]
    cantones,         // CrCanton[]
    distritos,        // CrDistrict[]
    isLoading,        // boolean
    error,            // string | null
    handleProvinceChange,
    handleCantonChange,
    resetAll,
  } = useCrLocations();

  // ...
};
```

**Funcionalidades:**
- ✅ **Auto-load** - Carga provincias al montar
- ✅ **Cascading** - Carga cantones/distritos automáticamente
- ✅ **Reset** - Métodos para resetear selecciones
- ✅ **Error handling** - Manejo de errores integrado

---

### 3. **LocationSelector Component**

**Archivo:** [src/features/locations-cr/components/LocationSelector.tsx](../src/features/locations-cr/components/LocationSelector.tsx)

**Uso:**

```typescript
import { LocationSelector } from '@/features/locations-cr';

<LocationSelector
  // Valores controlados
  province={formData.province}
  canton={formData.canton}
  district={formData.district}

  // Handlers
  onProvinceChange={(value) => setFormData({ ...formData, province: value })}
  onCantonChange={(value) => setFormData({ ...formData, canton: value })}
  onDistrictChange={(value) => setFormData({ ...formData, district: value })}

  // Opcionales
  errors={{ province: 'Error message' }}
  disabled={false}
  showLabels={true}
  required={true}
/>
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `province` | `string` | `''` | Provincia seleccionada |
| `canton` | `string` | `''` | Cantón seleccionado |
| `district` | `string` | `''` | Distrito seleccionado |
| `onProvinceChange` | `(value: string) => void` | - | **Required** |
| `onCantonChange` | `(value: string) => void` | - | **Required** |
| `onDistrictChange` | `(value: string) => void` | - | **Required** |
| `errors` | `{ province?: string, canton?: string, district?: string }` | `{}` | Errores de validación |
| `disabled` | `boolean` | `false` | Deshabilitar campos |
| `showLabels` | `boolean` | `true` | Mostrar labels |
| `required` | `boolean` | `true` | Mostrar asterisco (*) |

**Características:**
- ✅ **Componente controlado** - Valores desde props
- ✅ **Dropdowns jerárquicos** - Provincia → Cantón → Distrito
- ✅ **Carga automática** - Carga datos cuando cambian dependencias
- ✅ **Estados de loading** - Indicadores visuales
- ✅ **Validación visual** - Muestra errores
- ✅ **Accesible** - Labels, placeholders, estados disabled

---

## 💡 Casos de Uso

### Caso 1: AddressForm (✅ Implementado)

**Archivo:** [src/features/addresses/components/AddressForm.tsx](../src/features/addresses/components/AddressForm.tsx)

```typescript
import { LocationSelector } from '@/features/locations-cr';

const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    label: 'Casa',
    province: '',
    canton: '',
    district: '',
    address: '',
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Label selector */}
      <Select value={formData.label} onValueChange={...}>
        <SelectItem value="Casa">Casa</SelectItem>
        <SelectItem value="Trabajo">Trabajo</SelectItem>
        <SelectItem value="Otro">Otro</SelectItem>
      </Select>

      {/* Location selector */}
      <LocationSelector
        province={formData.province}
        canton={formData.canton}
        district={formData.district}
        onProvinceChange={(value) => setFormData({ ...formData, province: value })}
        onCantonChange={(value) => setFormData({ ...formData, canton: value })}
        onDistrictChange={(value) => setFormData({ ...formData, district: value })}
      />

      {/* Address details */}
      <Input
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="Calle, número, referencias..."
      />
    </form>
  );
};
```

---

### Caso 2: Checkout/Shipping Form (Pendiente)

```typescript
import { LocationSelector } from '@/features/locations-cr';

const ShippingForm = () => {
  const [shippingData, setShippingData] = useState({
    province: '',
    canton: '',
    district: '',
    address: '',
  });

  return (
    <form>
      <h3>Dirección de Envío</h3>

      <LocationSelector
        province={shippingData.province}
        canton={shippingData.canton}
        district={shippingData.district}
        onProvinceChange={(value) => setShippingData({ ...shippingData, province: value })}
        onCantonChange={(value) => setShippingData({ ...shippingData, canton: value })}
        onDistrictChange={(value) => setShippingData({ ...shippingData, district: value })}
        showLabels={true}
      />

      <Input
        placeholder="Dirección exacta de entrega"
        value={shippingData.address}
        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
      />
    </form>
  );
};
```

---

### Caso 3: Solo Hook (Custom UI)

Si necesitas crear tu propia UI personalizada:

```typescript
import { useCrLocations } from '@/features/locations-cr';

const CustomLocationForm = () => {
  const {
    provinces,
    cantones,
    distritos,
    isLoading,
    handleProvinceChange,
    handleCantonChange,
  } = useCrLocations();

  return (
    <div>
      {/* Custom dropdown for provinces */}
      <select onChange={(e) => handleProvinceChange(e.target.value)}>
        {provinces.map(p => (
          <option key={p.id} value={p.nombre}>{p.nombre}</option>
        ))}
      </select>

      {/* Custom dropdown for cantones */}
      <select onChange={(e) => handleCantonChange(e.target.value)}>
        {cantones.map(c => (
          <option key={c.id} value={c.nombre}>{c.nombre}</option>
        ))}
      </select>

      {/* Custom dropdown for distritos */}
      <select>
        {distritos.map(d => (
          <option key={d.id} value={d.nombre}>{d.nombre}</option>
        ))}
      </select>
    </div>
  );
};
```

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│   Usuario       │
│  (Selecciona)   │
└────────┬────────┘
         │ 1. Selecciona provincia
         ▼
┌─────────────────────────┐
│ LocationSelector        │
│ onProvinceChange()      │
└────────┬────────────────┘
         │ 2. Actualiza formData.province
         │ 3. Llama handleProvinceChange()
         ▼
┌─────────────────────────┐
│ useCrLocations          │
│ handleProvinceChange()  │
└────────┬────────────────┘
         │ 4. getCantones(province)
         ▼
┌─────────────────────────┐
│ locationsService        │
│ getCantones()           │
└────────┬────────────────┘
         │ 5. Busca en cache
         │    O llama API
         ▼
┌─────────────────────────┐
│ Backend Laravel         │
│ GET /v1/locations/cr    │
│ (cached 24h)            │
└────────┬────────────────┘
         │ 6. Retorna jerarquía
         ▼
┌─────────────────────────┐
│ locationsService        │
│ filtra cantones         │
└────────┬────────────────┘
         │ 7. setCantones([...])
         ▼
┌─────────────────────────┐
│ LocationSelector        │
│ Muestra cantones        │
└─────────────────────────┘
```

---

## 🚀 Performance

### Cache de Múltiples Niveles

1. **Frontend In-Memory Cache**
   - Variable `cachedLocations` en `locationsService`
   - Persiste durante sesión del navegador
   - Limpiable con `clearCache()`

2. **Backend Cache (Laravel)**
   - Cache de 24 horas en Redis/File
   - Key: `cr_locations_hierarchy`

3. **Resultado:**
   - ✅ Primera carga: ~200-500ms
   - ✅ Cargas subsecuentes: **<1ms** (in-memory)
   - ✅ Sin llamadas repetidas al API

---

## 📝 TypeScript Types

```typescript
interface CrDistrict {
  id: number;
  nombre: string;
}

interface CrCanton {
  id: number;
  nombre: string;
  distritos: CrDistrict[];
}

interface CrProvince {
  id: number;
  nombre: string;
  cantones: CrCanton[];
}

interface LocationSelection {
  province: string;
  canton: string;
  district: string;
}
```

---

## ✅ Validación

### Frontend (Zod)

```typescript
// address.validation.ts
export const addressSchema = z.object({
  province: z.string().min(1, 'La provincia es requerida'),
  canton: z.string().min(1, 'El cantón es requerido'),
  district: z.string().min(1, 'El distrito es requerido'),
});
```

### Backend (Laravel)

```php
// StoreAddressRequest.php
public function withValidator($validator)
{
    $validator->after(function ($validator) {
        $exists = CrLocation::locationExists(
            $this->province,
            $this->canton,
            $this->district
        );

        if (!$exists) {
            $validator->errors()->add(
                'district',
                'La combinación de Provincia, Cantón y Distrito no es válida'
            );
        }
    });
}
```

---

## 🧪 Testing

### Test Manual

1. **Cargar formulario de direcciones**
   - Verificar que carguen provincias
   - Seleccionar provincia
   - Verificar que carguen cantones
   - Seleccionar cantón
   - Verificar que carguen distritos

2. **Validación**
   - Intentar guardar sin seleccionar
   - Verificar mensajes de error

3. **Edición**
   - Editar dirección existente
   - Verificar que pre-cargue valores

### Test de Cache

```typescript
// En consola del navegador
import { locationsService } from '@/features/locations-cr';

// Primera carga (API call)
await locationsService.getCrLocations(); // ~200ms

// Segunda carga (cache)
await locationsService.getCrLocations(); // <1ms

// Limpiar cache
locationsService.clearCache();
```

---

## 🎨 UX Mejorada

### Antes (Inputs Manuales)
```
❌ Usuario escribe "San Jose" (sin tilde)
❌ Usuario escribe "san josé" (minúsculas)
❌ Backend rechaza: ubicación no válida
❌ Frustración del usuario
```

### Después (Dropdowns)
```
✅ Usuario selecciona "San José" del dropdown
✅ Valor exacto garantizado
✅ Backend valida correctamente
✅ Sin errores de tipeo
✅ Mejor experiencia
```

---

## 📊 Beneficios

| **Antes** | **Después** |
|-----------|-------------|
| Inputs manuales | Dropdowns jerárquicos |
| Errores de tipeo comunes | Valores exactos garantizados |
| Sin validación en tiempo real | Validación inmediata |
| Código duplicado en cada form | Componente reutilizable |
| Sin cache | Cache multi-nivel |
| UX frustrante | UX fluida |

---

## 🔧 Configuración

### 1. Instalar Feature

La feature ya está creada y lista para usar.

### 2. Importar en tu Componente

```typescript
import { LocationSelector } from '@/features/locations-cr';
```

### 3. Usar en Formulario

```typescript
<LocationSelector
  province={formData.province}
  canton={formData.canton}
  district={formData.district}
  onProvinceChange={(v) => handleChange('province', v)}
  onCantonChange={(v) => handleChange('canton', v)}
  onDistrictChange={(v) => handleChange('district', v)}
/>
```

---

## 🛒 **IMPORTANTE: Integración en Checkout/Carrito**

### ⚠️ **Concepto Clave: Address Snapshots**

Cuando un usuario realiza un pedido, **NO guardes solo el ID de la dirección**. Guarda un **snapshot completo** de los datos de la dirección.

#### **❌ Forma INCORRECTA:**

```typescript
// NO HACER ESTO
const order = {
  id: '123',
  userId: '456',
  shippingAddressId: '789',  // ❌ Solo el ID
  items: [...],
};

// Problema: Si el usuario elimina o edita la dirección #789,
// el pedido pierde la información de envío
```

#### **✅ Forma CORRECTA (Snapshot):**

```typescript
// HACER ESTO
const order = {
  id: '123',
  userId: '456',
  shippingAddress: {  // ✅ Snapshot completo
    province: 'San José',
    canton: 'Central',
    district: 'Carmen',
    address: 'Calle 5, Casa 10, Portón verde',
    label: 'Casa',
  },
  items: [...],
};

// Ventaja: Aunque el usuario borre o edite la dirección,
// el pedido conserva los datos originales de envío
```

---

### 📋 **Implementación en Checkout - Guía Paso a Paso**

#### **Paso 1: Crear tipos para el Checkout**

```typescript
// features/cart/types/checkout.types.ts

export interface ShippingAddressSnapshot {
  province: string;
  canton: string;
  district: string;
  address: string;
  label: string;
}

export interface CheckoutData {
  // Dirección de envío (snapshot)
  shippingAddress: ShippingAddressSnapshot | null;

  // Método de pago
  paymentMethod: 'card' | 'transfer' | 'cash';

  // Items del carrito
  items: CartItem[];

  // Totales
  subtotal: number;
  shippingCost: number;
  total: number;
}
```

---

#### **Paso 2: Crear componente de selección de dirección**

```typescript
// features/cart/components/ShippingAddressSelector.tsx

import React, { useState, useEffect } from 'react';
import { addressesService } from '@/features/addresses';
import { LocationSelector } from '@/features/locations-cr';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Address } from '@/features/addresses';
import type { ShippingAddressSnapshot } from '../types/checkout.types';

interface ShippingAddressSelectorProps {
  onAddressSelected: (snapshot: ShippingAddressSnapshot) => void;
}

export const ShippingAddressSelector: React.FC<ShippingAddressSelectorProps> = ({
  onAddressSelected
}) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    province: '',
    canton: '',
    district: '',
    address: '',
    label: 'Otro',
  });

  // Cargar direcciones guardadas
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const response = await addressesService.getMyAddresses();
      setSavedAddresses(response.data);

      // Pre-seleccionar la dirección predeterminada
      const defaultAddress = response.data.find(a => a.is_default);
      if (defaultAddress) {
        handleSelectSavedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  // Manejar selección de dirección guardada
  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);

    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      // Crear snapshot (sin ID, user_id, created_at, updated_at)
      const snapshot: ShippingAddressSnapshot = {
        province: address.province,
        canton: address.canton,
        district: address.district,
        address: address.address,
        label: address.label,
      };

      onAddressSelected(snapshot);
    }
  };

  // Manejar creación de nueva dirección (sin guardar)
  const handleUseNewAddress = () => {
    if (!newAddress.province || !newAddress.canton ||
        !newAddress.district || !newAddress.address) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Crear snapshot directamente (no se guarda en BD)
    const snapshot: ShippingAddressSnapshot = {
      province: newAddress.province,
      canton: newAddress.canton,
      district: newAddress.district,
      address: newAddress.address,
      label: newAddress.label,
    };

    onAddressSelected(snapshot);
  };

  // Manejar guardar nueva dirección Y usarla
  const handleSaveAndUseNewAddress = async () => {
    try {
      // 1. Guardar en BD
      const response = await addressesService.create({
        ...newAddress,
        is_default: false,
      });

      // 2. Crear snapshot de la dirección guardada
      const snapshot: ShippingAddressSnapshot = {
        province: response.data.province,
        canton: response.data.canton,
        district: response.data.district,
        address: response.data.address,
        label: response.data.label,
      };

      // 3. Seleccionar
      onAddressSelected(snapshot);

      // 4. Actualizar lista
      loadSavedAddresses();
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error al guardar dirección');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Dirección de Envío</h3>

      {/* Direcciones Guardadas */}
      {savedAddresses.length > 0 && (
        <RadioGroup value={selectedAddressId} onValueChange={handleSelectSavedAddress}>
          <div className="space-y-3">
            {savedAddresses.map(address => (
              <div key={address.id} className="flex items-start space-x-3 border p-4 rounded">
                <RadioGroupItem value={address.id} id={address.id} />
                <label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{address.label}</div>
                  <div className="text-sm text-gray-600">
                    {address.address}
                  </div>
                  <div className="text-sm text-gray-500">
                    {address.district}, {address.canton}, {address.province}
                  </div>
                  {address.is_default && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Predeterminada
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {/* Botón para agregar nueva dirección */}
      {!showNewAddressForm && (
        <Button
          variant="outline"
          onClick={() => setShowNewAddressForm(true)}
          className="w-full"
        >
          + Usar otra dirección
        </Button>
      )}

      {/* Formulario de nueva dirección */}
      {showNewAddressForm && (
        <div className="border p-4 rounded space-y-4">
          <h4 className="font-medium">Nueva Dirección de Envío</h4>

          {/* LocationSelector reutilizable */}
          <LocationSelector
            province={newAddress.province}
            canton={newAddress.canton}
            district={newAddress.district}
            onProvinceChange={(v) => setNewAddress({ ...newAddress, province: v })}
            onCantonChange={(v) => setNewAddress({ ...newAddress, canton: v })}
            onDistrictChange={(v) => setNewAddress({ ...newAddress, district: v })}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              Dirección exacta *
            </label>
            <input
              type="text"
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              placeholder="Calle, número, referencias..."
              className="w-full border rounded p-2"
              minLength={10}
            />
          </div>

          <div className="flex gap-2">
            {/* Usar sin guardar */}
            <Button
              variant="outline"
              onClick={handleUseNewAddress}
              className="flex-1"
            >
              Usar esta vez
            </Button>

            {/* Guardar y usar */}
            <Button
              onClick={handleSaveAndUseNewAddress}
              className="flex-1 bg-brand-orange"
            >
              Guardar y usar
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowNewAddressForm(false)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};
```

---

#### **Paso 3: Integrar en hook de checkout**

```typescript
// features/cart/hooks/useCheckout.ts

import { useState } from 'react';
import type { ShippingAddressSnapshot, CheckoutData } from '../types/checkout.types';

export const useCheckout = () => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shippingAddress: null,
    paymentMethod: 'card',
    items: [],
    subtotal: 0,
    shippingCost: 0,
    total: 0,
  });

  // Manejar selección de dirección
  const handleAddressSelected = (snapshot: ShippingAddressSnapshot) => {
    setCheckoutData(prev => ({
      ...prev,
      shippingAddress: snapshot,  // ✅ Guardar snapshot
    }));

    // Opcional: Calcular costo de envío basado en ubicación
    calculateShippingCost(snapshot.province, snapshot.canton);
  };

  // Calcular costo de envío (ejemplo)
  const calculateShippingCost = (province: string, canton: string) => {
    let cost = 0;

    // Lógica de ejemplo
    if (province === 'San José' && canton === 'Central') {
      cost = 2000; // ₡2000 zona central
    } else if (province === 'San José') {
      cost = 3000; // ₡3000 resto de San José
    } else {
      cost = 5000; // ₡5000 otras provincias
    }

    setCheckoutData(prev => ({
      ...prev,
      shippingCost: cost,
      total: prev.subtotal + cost,
    }));
  };

  // Procesar pedido
  const processOrder = async () => {
    if (!checkoutData.shippingAddress) {
      throw new Error('Selecciona una dirección de envío');
    }

    // Crear pedido con snapshot de dirección
    const orderData = {
      items: checkoutData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: checkoutData.shippingAddress,  // ✅ Snapshot
      paymentMethod: checkoutData.paymentMethod,
      subtotal: checkoutData.subtotal,
      shippingCost: checkoutData.shippingCost,
      total: checkoutData.total,
    };

    // Enviar al backend
    const response = await api.post('/v1/orders', orderData);
    return response.data;
  };

  return {
    checkoutData,
    handleAddressSelected,
    processOrder,
  };
};
```

---

#### **Paso 4: Backend - Guardar snapshot en la orden**

```php
// Backend: app/Models/Order.php

protected $casts = [
    'shipping_address' => 'array',  // JSON column
    'items' => 'array',
];

// Migration
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->json('shipping_address');  // ✅ Snapshot completo
    $table->json('items');
    $table->decimal('subtotal', 10, 2);
    $table->decimal('shipping_cost', 10, 2);
    $table->decimal('total', 10, 2);
    $table->string('status')->default('pending');
    $table->timestamps();
});
```

---

### 🎯 **Flujo Completo en Checkout**

```
┌────────────────────┐
│   Usuario en       │
│   Checkout         │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────────────┐
│ ShippingAddressSelector            │
│                                    │
│ Opción A: Seleccionar guardada    │
│ Opción B: Crear nueva (sin guardar)│
│ Opción C: Crear nueva y guardar   │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ Crear Snapshot                     │
│ {                                  │
│   province: "San José",            │
│   canton: "Central",               │
│   district: "Carmen",              │
│   address: "...",                  │
│   label: "Casa"                    │
│ }                                  │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ useCheckout.handleAddressSelected()│
│ - Guarda snapshot en checkoutData  │
│ - Calcula costo de envío           │
│ - Actualiza total                  │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ Usuario confirma pedido            │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ processOrder()                     │
│ POST /v1/orders                    │
│ {                                  │
│   shipping_address: {...},  ✅     │
│   items: [...],                    │
│   total: 25000                     │
│ }                                  │
└─────────┬──────────────────────────┘
          │
          ▼
┌────────────────────────────────────┐
│ Backend guarda orden               │
│ - shipping_address: JSON column    │
│ - Snapshot inmutable               │
│ - No afectado por cambios usuario  │
└────────────────────────────────────┘
```

---

### ✅ **Ventajas del Snapshot**

1. **Inmutabilidad** - El pedido conserva datos originales
2. **Histórico** - Sabes exactamente dónde se envió
3. **Sin dependencias** - No importa si usuario borra/edita dirección
4. **Auditoría** - Registro completo para soporte/reclamos
5. **Facturación** - Datos correctos para documentos tributarios

---

### ⚠️ **Errores Comunes a Evitar**

#### ❌ **Error 1: Guardar solo ID**
```typescript
// NO HACER
shippingAddressId: '123'  // ❌ Rompe si usuario borra dirección
```

#### ❌ **Error 2: Guardar referencia mutable**
```typescript
// NO HACER
shippingAddress: addressObject  // ❌ Si cambia, pedido cambia
```

#### ❌ **Error 3: No validar antes de enviar**
```typescript
// NO HACER
processOrder()  // ❌ Sin validar que shippingAddress existe
```

#### ✅ **Correcto:**
```typescript
// HACER
if (!checkoutData.shippingAddress) {
  throw new Error('Selecciona dirección');
}

const snapshot = {  // ✅ Copia inmutable
  province: address.province,
  canton: address.canton,
  // ...
};
```

---

## 🚧 Próximos Pasos

1. **✅ Integrar en Checkout/Cart** (Documentado arriba)
   - Usar `LocationSelector` en formulario de envío
   - Implementar snapshot pattern
   - Calcular costos de envío por ubicación

2. **Búsqueda/Filtrado**
   - Agregar búsqueda en dropdowns
   - Filtro de ubicaciones frecuentes

3. **Analytics**
   - Trackear ubicaciones más usadas
   - Optimizar orden de resultados

4. **Offline Support**
   - Service Worker para cache offline
   - IndexedDB para persistencia

---

## 📞 Soporte

Para usar esta feature:
1. Revisar este documento
2. Ver ejemplos en `AddressForm.tsx`
3. Consultar tipos en `locations.types.ts`
4. **Para checkout:** Seguir guía de snapshots arriba

---

**Autor:** Claude Code
**Versión:** 1.1.0
**Última actualización:** 2025-11-20 (Agregada sección de Checkout)
