'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown, 
  Users, 
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Video,
  MessageCircle,
  Shield
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Básico',
      description: 'Perfecto para comenzar tu journey en calistenia',
      icon: <Users className="h-6 w-6" />,
      price: {
        monthly: 0,
        yearly: 0
      },
      badge: null,
      features: [
        { name: 'Acceso a rutinas básicas', included: true },
        { name: 'Seguimiento de progreso básico', included: true },
        { name: 'Comunidad de principiantes', included: true },
        { name: 'Videos instructivos básicos', included: true },
        { name: 'Rutinas personalizadas', included: false },
        { name: 'Coaching personalizado', included: false },
        { name: 'Análisis avanzado', included: false },
        { name: 'Soporte prioritario', included: false }
      ],
      cta: 'Comenzar Gratis',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Para atletas serios que buscan resultados consistentes',
      icon: <Zap className="h-6 w-6" />,
      price: {
        monthly: 19.99,
        yearly: 199.99
      },
      badge: 'Más Popular',
      features: [
        { name: 'Todo del plan Básico', included: true },
        { name: 'Rutinas personalizadas ilimitadas', included: true },
        { name: 'Análisis detallado de progreso', included: true },
        { name: 'Biblioteca completa de ejercicios', included: true },
        { name: 'Planificación de entrenamientos', included: true },
        { name: 'Seguimiento nutricional básico', included: true },
        { name: 'Coaching personalizado', included: false },
        { name: 'Acceso a masterclasses', included: false }
      ],
      cta: 'Comenzar Prueba Gratuita',
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      description: 'La experiencia completa con coaching personalizado',
      icon: <Crown className="h-6 w-6" />,
      price: {
        monthly: 49.99,
        yearly: 499.99
      },
      badge: 'Premium',
      features: [
        { name: 'Todo del plan Pro', included: true },
        { name: 'Coaching personalizado 1:1', included: true },
        { name: 'Planes nutricionales personalizados', included: true },
        { name: 'Acceso a masterclasses exclusivas', included: true },
        { name: 'Soporte prioritario 24/7', included: true },
        { name: 'Sesiones de video llamada mensuales', included: true },
        { name: 'Análisis biomecánico avanzado', included: true },
        { name: 'Acceso anticipado a nuevas funciones', included: true }
      ],
      cta: 'Comenzar Elite',
      popular: false
    }
  ];

  const faqs = [
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejarán en tu próximo ciclo de facturación.'
    },
    {
      question: '¿Hay algún compromiso a largo plazo?',
      answer: 'No, todos nuestros planes son sin compromiso. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control.'
    },
    {
      question: '¿Qué incluye la prueba gratuita?',
      answer: 'La prueba gratuita de 7 días incluye acceso completo al plan Pro. No se requiere tarjeta de crédito para comenzar.'
    },
    {
      question: '¿Ofrecen descuentos para estudiantes?',
      answer: 'Sí, ofrecemos un 50% de descuento para estudiantes verificados. Contáctanos con tu identificación estudiantil válida.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito principales, PayPal y transferencias bancarias para planes anuales.'
    },
    {
      question: '¿Puedo obtener un reembolso?',
      answer: 'Ofrecemos una garantía de reembolso de 30 días para todos los planes pagos. Sin preguntas.'
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
    return price === 0 ? 'Gratis' : `$${price}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.price.yearly === 0) return null;
    const monthlyCost = plan.price.monthly * 12;
    const savings = monthlyCost - plan.price.yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Calisthenics Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
              <Button size="sm">
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Elige tu plan de
            <span className="text-blue-600"> entrenamiento</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Desde principiante hasta atleta elite, tenemos el plan perfecto para tu journey en calistenia
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'yearly' && (
              <Badge variant="secondary" className="ml-2">
                Ahorra hasta 17%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} transition-all hover:shadow-lg`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{billingCycle === 'monthly' ? 'mes' : 'año'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && getSavings(plan) && (
                      <p className="text-sm text-green-600 mt-1">
                        Ahorra {getSavings(plan)}% anualmente
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-gray-600">
              Herramientas profesionales para tu desarrollo en calistenia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Rutinas Personalizadas</h3>
              <p className="text-gray-600 text-sm">
                Entrenamientos adaptados a tu nivel y objetivos específicos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seguimiento de Progreso</h3>
              <p className="text-gray-600 text-sm">
                Analiza tu evolución con métricas detalladas y visualizaciones
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Videos HD</h3>
              <p className="text-gray-600 text-sm">
                Biblioteca completa de ejercicios con instrucciones detalladas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunidad Activa</h3>
              <p className="text-gray-600 text-sm">
                Conecta con otros atletas y comparte tu progreso
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Resolvemos tus dudas sobre nuestros planes
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu físico?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de atletas que ya están alcanzando sus objetivos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Comenzar Prueba Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Calisthenics Platform</h3>
              <p className="text-gray-400 text-sm">
                La plataforma líder para el entrenamiento de calistenia y desarrollo físico.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Características</li>
                <li>Precios</li>
                <li>API</li>
                <li>Integraciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Estado del Sistema</li>
                <li>Actualizaciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacidad</li>
                <li>Términos</li>
                <li>Cookies</li>
                <li>Licencias</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Calisthenics Platform. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Pagos seguros</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}