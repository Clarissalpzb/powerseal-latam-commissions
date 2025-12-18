# CommissionHub - Sistema de Gestión de Comisiones

## 📋 Descripción del Proyecto

CommissionHub es una aplicación web diseñada para automatizar el proceso de gestión de comisiones para vendedores. Reemplaza el sistema manual basado en papel con un flujo de trabajo estructurado que incluye validación de facturas PDF, prevención de duplicados, reglas automatizadas de comisión y seguimiento de recibos de pago.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Estado Global**: Redux Toolkit
- **Estilos**: TailwindCSS con sistema de componentes personalizado
- **Persistencia**: localStorage (temporal, migrará a PostgreSQL)
- **Moneda**: Peso mexicano (MXN) con formato local es-MX
- **Validación**: Archivos PDF, límites de tamaño, validación de formularios

### Paleta de Colores (Inspirada en FreshBooks)
- **Primario**: Teal moderno (#14b8a6) - Para acciones principales
- **Secundario**: Grises neutros - Para texto y elementos de UI
- **Success**: Verde - Para estados aprobados/pagados
- **Warning**: Amarillo/Naranja - Para estados pendientes/alertas
- **Error**: Rojo - Para estados rechazados/errores

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes compartidos
│   └── TestingHeader.tsx # Header con toggle de roles para testing
├── features/            # Módulos por dominio
│   ├── salesperson/     # Dashboard y componentes de vendedor
│   │   ├── Dashboard.tsx
│   │   └── components/
│   │       ├── SubmissionForm.tsx    # Formulario de nueva solicitud
│   │       ├── SubmissionsList.tsx   # Lista de solicitudes
│   │       ├── Analytics.tsx         # Dashboard de métricas
│   │       └── EditSubmissionModal.tsx # Modal de edición
│   └── manager/         # Dashboard y componentes de manager
│       ├── Dashboard.tsx
│       └── components/
│           ├── ReviewSubmission.tsx   # Modal de revisión
│           ├── UserManagement.tsx     # Gestión de usuarios
│           └── ManagerAnalytics.tsx   # Métricas para manager
├── hooks/               # Custom hooks
│   └── useAuth.ts       # Hook de autenticación (mock)
├── store/              # Redux store
│   ├── index.ts        # Configuración del store + localStorage
│   └── slices/
│       ├── authSlice.ts         # Estado de autenticación
│       └── submissionsSlice.ts  # Estado de solicitudes
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Tipos principales (CommissionSubmission, etc.)
├── utils/              # Utilidades
│   ├── currency.ts     # Formateo de moneda mexicana
│   └── sampleData.ts   # Datos de ejemplo (removido)
└── App.tsx            # Componente principal con routing
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticación Mock
- **Usuarios de prueba**:
  - Roberto Cosio (Salesperson, ID: user-1)
  - Sarah Manager (Manager, ID: user-2)
- **Toggle de roles** para testing fácil
- **Persistencia de sesión** en localStorage

### ✅ Dashboard de Vendedor
- **Formulario de solicitudes** con validaciones avanzadas
- **Selección de tipo de documento**: Factura vs Orden de Compra
- **Cálculo automático de comisiones** basado en días de pago:
  - 0-45 días: 100% de comisión
  - 46-60 días: 70% de comisión
  - 61-90 días: 50% de comisión
  - +90 días: 0% de comisión
- **Advertencias de IVA** prominentes
- **Subida de PDF** con validación de tipo y tamaño
- **Edición y eliminación** de solicitudes propias (solo estado pending)
- **Analytics en tiempo real** de comisiones y submissions

### ✅ Dashboard de Manager
- **Revisión de solicitudes** con modal detallado
- **Aprobación/Rechazo** de solicitudes con notas
- **Verificación de montos** vs PDF
- **Gestión de estados**: Pending → Under Review → Approved/Rejected → Paid
- **Subida de comprobantes de pago**
- **Métricas en tiempo real** de todas las solicitudes

### ✅ Sistema de Estado de Solicitudes
```
pending → under_review → approved → paid
                    ↓
                 flagged/rejected
```

### ✅ Persistencia de Datos
- **localStorage middleware** automático
- **Recuperación de datos** en recarga de página
- **Sin pérdida de submissions** entre sesiones

### ✅ Características de UX
- **Filtrado de datos** por rol (vendedor ve solo sus solicitudes)
- **Interfaz responsiva** para móvil y desktop
- **Feedback visual** inmediato en acciones
- **Tooltips y ayudas** contextuales
- **Validación de formularios** en tiempo real

## 🛠️ Funcionalidades Técnicas Avanzadas

### Cálculo de Comisiones
```typescript
const calculateCommissionPercentage = (invoiceDate: string, paymentDate: string): number => {
  const daysDiff = Math.floor((payment.getTime() - invoice.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 45) return 1.0; // 100%
  if (daysDiff <= 60) return 0.7; // 70%
  if (daysDiff <= 90) return 0.5; // 50%
  return 0; // 0% after 90 days
};
```

### Persistencia Automática
```typescript
// Middleware que guarda automáticamente en localStorage
const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  if (action.type?.startsWith('submissions/')) {
    const state = store.getState();
    localStorage.setItem('commissionhub_submissions', JSON.stringify(state.submissions.submissions));
  }
  return result;
};
```

### Formateo de Moneda Mexicana
```typescript
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};
```

## 🚧 Funcionalidades Pendientes (Roadmap)

### 🔄 Corto Plazo (Próximas 2-4 semanas)
1. **Procesamiento de PDF**
   - Extracción automática de montos de facturas PDF
   - Validación de números de factura
   - Detección de facturas duplicadas

2. **Sistema de Notificaciones**
   - Alertas para managers sobre nuevas solicitudes
   - Notificaciones para vendedores sobre cambios de estado
   - Recordatorios de pagos pendientes

3. **Mejoras de Seguridad**
   - Autenticación real con JWT
   - Validación de roles en backend
   - Encriptación de datos sensibles

4. **Exportación de Datos**
   - Generación de reportes PDF
   - Exportación a Excel/CSV
   - Reportes de comisiones por período

### 🎯 Mediano Plazo (1-3 meses)
1. **Backend Completo (FastAPI)**
   - API RESTful con SQLAlchemy
   - Base de datos PostgreSQL
   - Sistema de archivos para PDFs
   - Cache con Redis

2. **Gestión de Usuarios Avanzada**
   - Registro de nuevos vendedores
   - Aprobación de cuentas
   - Configuración de tasas de comisión por vendedor
   - Jerarquías de managers

3. **Analytics Avanzados**
   - Dashboards con gráficos (Chart.js)
   - Métricas de rendimiento por vendedor
   - Tendencias de comisiones históricas
   - Comparativas por período

4. **Flujo de Aprobaciones**
   - Múltiples niveles de aprobación
   - Workflow configurable
   - Historial de cambios
   - Comentarios y conversaciones

### 🚀 Largo Plazo (3+ meses)
1. **Integraciones Externas**
   - Conexión con sistemas ERP
   - Integración con bancos para pagos
   - APIs de validación fiscal (SAT)
   - Webhooks para sistemas externos

2. **Mobile App**
   - App nativa o React Native
   - Notificaciones push
   - Cámara para captura de documentos
   - Sincronización offline

3. **IA y Automatización**
   - OCR avanzado para PDFs
   - Detección automática de anomalías
   - Predicción de tiempos de pago
   - Sugerencias de acciones

4. **Multi-tenancy**
   - Soporte para múltiples empresas
   - Configuraciones por tenant
   - Facturación por uso
   - Panel de administración global

## 🧪 Testing y Desarrollo

### Usuarios de Prueba
- **Roberto Cosio** (Vendedor): `user-1`, comisión 3%
- **Sarah Manager** (Manager): `user-2`, acceso completo

### Comandos de Desarrollo
```bash
npm run dev     # Servidor de desarrollo (localhost:3001)
npm run build   # Build de producción
npm run preview # Preview del build
```

### Datos de Prueba
El sistema inicia sin datos dummy. Los usuarios pueden:
- Crear nuevas solicitudes de comisión
- Probar el flujo completo de vendedor → manager
- Experimentar con diferentes tipos de documento
- Verificar cálculos de comisión con distintas fechas de pago

## 📋 Notas de Implementación

### Decisiones de Diseño
1. **localStorage temporal**: Para demo/MVP, migrará a PostgreSQL
2. **Mock authentication**: Simplifica testing, será JWT real
3. **Componente único**: SubmissionsList usado por ambos roles con props diferentes
4. **Redux para estado**: Facilita compartir datos entre componentes
5. **TypeScript estricto**: Previene errores en desarrollo

### Convenciones de Código
- Componentes en PascalCase
- Archivos de utilidad en camelCase
- Tipos en PascalCase con sufijo si es necesario
- Estados Redux en camelCase
- CSS classes en kebab-case (TailwindCSS)

### Mejores Prácticas Implementadas
- Separación de responsabilidades por dominio
- Componentes reutilizables
- Tipado estricto con TypeScript
- Validación en el frontend
- Feedback visual inmediato
- Responsive design mobile-first
- Accesibilidad básica (ARIA labels, keyboard navigation)

## 🐛 Problemas Conocidos

1. **ESLint Configuration**: Falta configuración de ESLint
2. **Error Boundaries**: No implementados para manejo de errores
3. **Loading States**: Faltantes en algunas operaciones async
4. **Optimistic Updates**: No implementadas en Redux

## 📞 Información de Contacto

Para dudas, sugerencias o reportar issues:
- Desarrollado con Claude Code por Anthropic
- Proyecto: PowerSeal LATAM Commissions
- Repositorio: `powerseal-latam-commissions`