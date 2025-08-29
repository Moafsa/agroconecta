import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Loader2, Sprout, Check, CreditCard, Landmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import InputMask from 'react-input-mask'; // Removido

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    contato: '',
    regiao_atuacao: '',
    cpf_cnpj: '', // Add cpf_cnpj field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PIX'); // Default to PIX
  
  const { login, refreshUser } = useAuth(); // Obter refreshUser do contexto
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar plano selecionado do localStorage
    const plan = localStorage.getItem('selectedPlan');
    if (plan) {
      setSelectedPlan(JSON.parse(plan));
    } else {
      // Se não há plano selecionado, redirecionar para home
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const isCliente = selectedPlan?.categoria === 'CLIENTE';
      
      const registerData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        contato: formData.contato,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Send only numbers
        ...(isCliente 
          ? { regiao: formData.regiao_atuacao }
          : { regiao_atuacao: formData.regiao_atuacao }
        )
      };

      // 1. Register the user
      isCliente 
        ? await authAPI.registerCliente(registerData)
        : await authAPI.register(registerData);
      
      // 2. Login the user and get the token
      await login(formData.email, formData.senha);
      
      // 3. After successful login, proceed to payment or profile
      if (parseFloat(selectedPlan.valor) === 0) {
        navigate('/profile');
      } else {
        try {
          // The apiRequest will now use the correct, newly set token
          const paymentResponse = await authAPI.createDirectPayment({
            planoId: selectedPlan.id,
            billingType: paymentMethod,
          });
          
          if (paymentResponse.checkout_url) {
            // !!! ATUALIZAR O ESTADO DO USUÁRIO ANTES DE REDIRECIONAR !!!
            await refreshUser(); 
            window.location.href = paymentResponse.checkout_url;
          } else {
            console.error('Checkout URL not available');
            setError('Error generating checkout. Please try again.');
          }
        } catch (paymentError) {
          console.error('Error creating payment:', paymentError);
          setError(paymentError.message || 'Error processing payment. Please try again.');
        }
      }
    } catch (authError) {
      setError(authError.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="h-12 w-12 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Agro-Conecta</span>
          </Link>
          <h2 className="text-xl text-gray-600">Cadastro de Profissional</h2>
        </div>

        {/* Plano Selecionado */}
        {selectedPlan && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">{selectedPlan.nome}</h3>
                  <p className="text-sm text-green-600">{selectedPlan.descricao}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {parseFloat(selectedPlan.valor) === 0 ? 'Grátis' : `R$ ${parseFloat(selectedPlan.valor).toFixed(2)}`}
                  </div>
                  {parseFloat(selectedPlan.valor) > 0 && <div className="text-sm text-green-600">/mês</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {selectedPlan?.categoria === 'CLIENTE' ? 'Cadastro de Cliente' : 'Cadastro de Profissional'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato">Telefone</Label>
                <Input
                  id="contato"
                  name="contato"
                  type="tel"
                  value={formData.contato}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regiao_atuacao">Região de Atuação</Label>
                <Input
                  id="regiao_atuacao"
                  name="regiao_atuacao"
                  type="text"
                  value={formData.regiao_atuacao}
                  onChange={handleChange}
                  required
                  placeholder="Ex: São Paulo, Interior de SP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF ou CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  name="cpf_cnpj"
                  placeholder="Apenas números"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  placeholder="Confirme sua senha"
                />
              </div>

              {/* Payment Method Selection for Paid Plans */}
              {selectedPlan && parseFloat(selectedPlan.valor) > 0 && (
                <div className="space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <RadioGroup
                    defaultValue="PIX"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="PIX" id="pix" className="sr-only" />
                      <Landmark className="mb-3 h-6 w-6" />
                      PIX
                    </Label>
                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="CREDIT_CARD" id="credit_card" className="sr-only" />
                      <CreditCard className="mb-3 h-6 w-6" />
                      Cartão de Crédito
                    </Label>
                  </RadioGroup>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full agro-gradient text-white !mt-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : parseFloat(selectedPlan?.valor) === 0 ? (
                  'Criar Conta Grátis'
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Criar Conta e Pagar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar para o chat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

