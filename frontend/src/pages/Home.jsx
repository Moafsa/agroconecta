import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sprout, Users, MessageCircle, Star, Check, ArrowRight, UserCheck, Building } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MENSAL');

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/planos');
      if (response.ok) {
        const data = await response.json();
        setPlanos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plano) => {
    // Calcular valor baseado no período selecionado
    let valorFinal = plano.valor;
    let periodoFinal = 'MENSAL';
    
    if (plano.valor > 0) {
      switch (selectedPeriod) {
        case 'ANUAL':
          valorFinal = plano.valor * 12 * 0.75; // 25% desconto
          periodoFinal = 'ANUAL';
          break;
        case 'SEMESTRAL':
          valorFinal = plano.valor * 6 * 0.85; // 15% desconto
          periodoFinal = 'SEMESTRAL';
          break;
        default:
          valorFinal = plano.valor;
          periodoFinal = 'MENSAL';
      }
    }
    
    // Criar objeto do plano com valor ajustado
    const planoSelecionado = {
      ...plano,
      valor: valorFinal,
      periodo: periodoFinal,
      periodoOriginal: selectedPeriod
    };
    
    // Armazenar o plano selecionado no localStorage
    localStorage.setItem('selectedPlan', JSON.stringify(planoSelecionado));
    
    // Redirecionar para cadastro
    navigate('/register');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatePrice = (baseValue, period) => {
    if (baseValue === 0) return 0;
    
    switch (period) {
      case 'ANUAL':
        return baseValue * 12 * 0.75; // 25% desconto
      case 'SEMESTRAL':
        return baseValue * 6 * 0.85; // 15% desconto
      default:
        return baseValue;
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'ANUAL':
        return 'ano';
      case 'SEMESTRAL':
        return 'semestre';
      default:
        return 'mês';
    }
  };

  const planosProfissionais = planos.filter(p => p.categoria === 'PROFISSIONAL');
  const planosClientes = planos.filter(p => p.categoria === 'CLIENTE');

  // Organizar planos por tipo
  const organizarPlanos = (planos) => {
    // Encontrar plano free (valor 0) - mais robusto
    const free = planos.find(p => {
      const valor = parseFloat(p.valor);
      return valor === 0 || p.valor === 0 || p.valor === '0' || p.valor === '0.00';
    });
    
    // Encontrar plano básico (valor > 0)
    const basic = planos.find(p => {
      const valor = parseFloat(p.valor);
      return p.tipo_plano === 'BASICO' && valor > 0;
    });
    
    // Encontrar plano premium
    const premium = planos.find(p => p.tipo_plano === 'PREMIUM');
    
    return { free, basic, premium };
  };

  const planosProfissionaisOrg = organizarPlanos(planosProfissionais);
  const planosClientesOrg = organizarPlanos(planosClientes);



  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Conecte-se aos Melhores Profissionais do Agronegócio
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Encontre especialistas qualificados para suas necessidades rurais
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => document.getElementById('planos').scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Planos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600"
                onClick={() => document.getElementById('chat').scrollIntoView({ behavior: 'smooth' })}
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Planos */}
      <div id="planos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Conecte-se com profissionais qualificados ou ofereça seus serviços
            </p>
            
            {/* Toggle de Período */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setSelectedPeriod('MENSAL')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === 'MENSAL'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setSelectedPeriod('SEMESTRAL')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === 'SEMESTRAL'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semestral (Economize 15%)
                </button>
                <button
                  onClick={() => setSelectedPeriod('ANUAL')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === 'ANUAL'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual (Economize 25%)
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando planos...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Planos para Clientes */}
              <div>
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <Building className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Para Produtores e Empresas</h3>
                  </div>
                  <p className="text-gray-600">Conecte-se com profissionais especializados para suas necessidades</p>
                </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                   {/* Plano Free */}
                   {planosClientesOrg.free && (
                     <Card className="relative">
                       <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                         <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                       </div>
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Free</CardTitle>
                         <div className="text-3xl font-bold text-green-600">Grátis</div>
                         <p className="text-gray-600 text-sm">Ideal para começar a conectar-se com profissionais</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Até 5 consultas por semana</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso a profissionais da região</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Chat básico</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Gratuito para sempre</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           variant="outline"
                           onClick={() => handleSelectPlan(planosClientesOrg.free)}
                         >
                           Começar Grátis
                         </Button>
                       </CardContent>
                     </Card>
                   )}

                   {/* Plano Básico */}
                   {planosClientesOrg.basic && (
                     <Card className="relative">
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Básico</CardTitle>
                         <div className="text-3xl font-bold text-green-600">
                           {formatCurrency(calculatePrice(planosClientesOrg.basic.valor, selectedPeriod))}
                           <span className="text-sm text-gray-500">/{getPeriodLabel(selectedPeriod)}</span>
                         </div>
                         <p className="text-gray-600 text-sm">Perfeito para produtores que querem conectar com profissionais</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Até 3 consultas por dia</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso a profissionais da região</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Chat direto com profissionais</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Suporte básico</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           variant="outline"
                           onClick={() => handleSelectPlan(planosClientesOrg.basic)}
                         >
                           Escolher Plano
                         </Button>
                       </CardContent>
                     </Card>
                   )}

                   {/* Plano Premium */}
                   {planosClientesOrg.premium && (
                     <Card className="relative border-green-500 shadow-lg">
                       <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                         <Badge className="bg-green-500 text-white">MAIS POPULAR</Badge>
                       </div>
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Premium</CardTitle>
                         <div className="text-3xl font-bold text-green-600">
                           {formatCurrency(calculatePrice(planosClientesOrg.premium.valor, selectedPeriod))}
                           <span className="text-sm text-gray-500">/{getPeriodLabel(selectedPeriod)}</span>
                         </div>
                         <p className="text-gray-600 text-sm">Para produtores que precisam de acesso completo</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Consultas ilimitadas</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso a todos os profissionais</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Chat prioritário</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Suporte 24/7</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           onClick={() => handleSelectPlan(planosClientesOrg.premium)}
                         >
                           Escolher Plano
                         </Button>
                       </CardContent>
                     </Card>
                   )}
                 </div>
              </div>

              {/* Planos para Profissionais */}
              <div>
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <UserCheck className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Para Profissionais</h3>
                  </div>
                  <p className="text-gray-600">Ofereça seus serviços e conecte-se com produtores que precisam de ajuda</p>
                </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                   {/* Plano Free */}
                   {planosProfissionaisOrg.free && (
                     <Card className="relative">
                       <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                         <Badge className="bg-blue-500 text-white">GRÁTIS</Badge>
                       </div>
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Free</CardTitle>
                         <div className="text-3xl font-bold text-blue-600">Grátis</div>
                         <p className="text-gray-600 text-sm">Ideal para profissionais iniciantes</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Até 5 consultas por semana</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Perfil profissional básico</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso limitado a produtores</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Gratuito para sempre</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           variant="outline"
                           onClick={() => handleSelectPlan(planosProfissionaisOrg.free)}
                         >
                           Começar Grátis
                         </Button>
                       </CardContent>
                     </Card>
                   )}

                   {/* Plano Básico */}
                   {planosProfissionaisOrg.basic && (
                     <Card className="relative">
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Básico</CardTitle>
                         <div className="text-3xl font-bold text-blue-600">
                           {formatCurrency(calculatePrice(planosProfissionaisOrg.basic.valor, selectedPeriod))}
                           <span className="text-sm text-gray-500">/{getPeriodLabel(selectedPeriod)}</span>
                         </div>
                         <p className="text-gray-600 text-sm">Ideal para profissionais iniciantes no setor agrícola</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Até 3 consultas por dia</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Perfil profissional completo</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso a produtores da região</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Relatórios básicos</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           variant="outline"
                           onClick={() => handleSelectPlan(planosProfissionaisOrg.basic)}
                         >
                           Escolher Plano
                         </Button>
                       </CardContent>
                     </Card>
                   )}

                   {/* Plano Premium */}
                   {planosProfissionaisOrg.premium && (
                     <Card className="relative border-blue-500 shadow-lg">
                       <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                         <Badge className="bg-blue-500 text-white">MAIS POPULAR</Badge>
                       </div>
                       <CardHeader className="text-center">
                         <CardTitle className="text-xl">Plano Premium</CardTitle>
                         <div className="text-3xl font-bold text-blue-600">
                           {formatCurrency(calculatePrice(planosProfissionaisOrg.premium.valor, selectedPeriod))}
                           <span className="text-sm text-gray-500">/{getPeriodLabel(selectedPeriod)}</span>
                         </div>
                         <p className="text-gray-600 text-sm">Para profissionais experientes</p>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 mb-6">
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Consultas ilimitadas</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Perfil profissional destacado</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Acesso a todos os produtores</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-gray-600">Suporte prioritário</span>
                           </li>
                         </ul>
                         <Button 
                           className="w-full" 
                           onClick={() => handleSelectPlan(planosProfissionaisOrg.premium)}
                         >
                           Escolher Plano
                         </Button>
                       </CardContent>
                     </Card>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="chat" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-0">
                <ChatWindow />
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  Como Funciona
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</span>
                    <p>Descreva sua necessidade no chat</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</span>
                    <p>Receba sugestões de profissionais qualificados</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</span>
                    <p>Conecte-se diretamente com o especialista</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Especialidades
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Agronomia</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Zootecnia</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Veterinária</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Irrigação</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Solos</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Nutrição</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-green-600" />
                  Profissionais Verificados
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Todos os nossos profissionais são verificados e possuem experiência comprovada no agronegócio.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">500+</div>
                    <div className="text-gray-500">Profissionais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-gray-500">Avaliação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

