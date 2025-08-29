import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const AdminClienteEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({
    nome: '',
    email: '',
    contato: '',
    regiao: '',
    documento: '',
    senha: '', // Campo para nova senha
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const data = await adminAPI.getCliente(id);
        // Não preenchemos a senha, pois não a recebemos do backend
        setCliente({
          nome: data.nome || '',
          email: data.email || '',
          contato: data.contato || '',
          regiao: data.regiao || '',
          documento: data.documento || '',
          senha: '',
        });
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
        toast.error('Não foi possível carregar os dados do cliente.');
        navigate('/admin/clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prevCliente) => ({
      ...prevCliente,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cria uma cópia dos dados para não modificar o estado diretamente
    const dadosParaAtualizar = { ...cliente };

    // Se o campo senha estiver vazio, removemos para não enviar uma senha em branco
    if (!dadosParaAtualizar.senha) {
      delete dadosParaAtualizar.senha;
    }

    try {
      await adminAPI.updateCliente(id, dadosParaAtualizar);
      toast.success('Cliente atualizado com sucesso!');
      navigate('/admin/clientes');
    } catch (error) {
      console.error('Erro ao atualizar o cliente:', error);
      toast.error(error.message || 'Falha ao salvar as alterações.');
    }
  };

  if (loading) {
    return <div>Carregando dados do cliente...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Cliente: {cliente.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                value={cliente.nome}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={cliente.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                name="contato"
                value={cliente.contato}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="regiao">Região</Label>
              <Input
                id="regiao"
                name="regiao"
                value={cliente.regiao}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
              <Input
                id="documento"
                name="documento"
                value={cliente.documento}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="senha">Nova Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="Deixe em branco para não alterar"
                value={cliente.senha}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/clientes')}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClienteEditar;
