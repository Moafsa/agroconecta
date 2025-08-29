import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Loader2, Plus, X, Save, Upload, User, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { professionalAPI } from '../lib/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    foto: '',
    especialidades: [],
    regiao_atuacao: '',
    agenda_disponibilidade: []
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      console.log('Carregando perfil para usuário:', user);
      const response = await professionalAPI.getProfile();
      const profile = response.profissional;
      
      console.log('Perfil carregado:', profile);
      
      setFormData({
        foto: profile.foto || '',
        especialidades: profile.especialidades || [],
        regiao_atuacao: profile.regiao_atuacao || '',
        agenda_disponibilidade: profile.agenda_disponibilidade || []
      });
      
      // Configurar foto
      if (profile.foto) {
        setFormData(prev => ({ ...prev, foto: profile.foto }));
        setImagePreview(profile.foto);
      } else if (user.foto) {
        setFormData(prev => ({ ...prev, foto: user.foto }));
        setImagePreview(user.foto);
      }
      
      // Não atualizar o usuário automaticamente para evitar re-render
      console.log('Perfil carregado com sucesso');
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleAddSpecialty = () => {
    console.log('Adicionando especialidade:', newSpecialty);
    console.log('Especialidades atuais:', formData.especialidades);
    
    if (newSpecialty.trim() && !formData.especialidades.includes(newSpecialty.trim())) {
      const novasEspecialidades = [...formData.especialidades, newSpecialty.trim()];
      console.log('Novas especialidades:', novasEspecialidades);
      
      setFormData({
        ...formData,
        especialidades: novasEspecialidades
      });
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData({
      ...formData,
      especialidades: formData.especialidades.filter(s => s !== specialty)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({ ...prev, foto: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, foto: url }));
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Enviando dados do formulário:', formData);
      
      // Preparar dados para envio
      const dadosParaEnviar = {
        ...formData,
        // Simplificar agenda_disponibilidade
        agenda_disponibilidade: formData.agenda_disponibilidade || ''
      };
      
      console.log('Dados preparados para envio:', dadosParaEnviar);
      
      await professionalAPI.updateProfile(dadosParaEnviar);
      setMessage({ 
        type: 'success', 
        text: 'Perfil atualizado com sucesso!' 
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao atualizar perfil' 
      });
    } finally {
      setLoading(false);
    }
  };

  const commonSpecialties = [
    'Agronomia', 'Zootecnia', 'Veterinária', 'Irrigação', 
    'Solos', 'Nutrição Animal', 'Fitossanidade', 'Mecanização',
    'Gestão Rural', 'Sustentabilidade', 'Agricultura Orgânica'
  ];

  return (
    <div className="professional-dashboard">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">
            Mantenha suas informações atualizadas para receber mais oportunidades
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message.text && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Informações do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações já cadastradas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Informações do Cadastro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Nome Completo</Label>
                    <p className="text-gray-900 font-medium">{user?.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Telefone</Label>
                    <p className="text-gray-900 font-medium">{user?.contato}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Estas informações foram fornecidas durante o cadastro e não podem ser alteradas aqui.
                </p>
              </div>

              {/* Região de Atuação */}
              <div className="space-y-2">
                <Label htmlFor="regiao_atuacao">Região de Atuação</Label>
                <Input
                  id="regiao_atuacao"
                  name="regiao_atuacao"
                  value={formData.regiao_atuacao}
                  onChange={handleChange}
                  placeholder="Ex: São Paulo, Interior de SP, Todo o Brasil"
                  required
                />
              </div>

              {/* Foto de Perfil */}
              <div className="space-y-4">
                <Label>Foto de Perfil</Label>
                
                {/* Preview da foto */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview} alt="Foto de perfil" />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Ou cole uma URL da sua foto
                    </p>
                  </div>
                </div>

                <Input
                  type="url"
                  value={formData.foto}
                  onChange={handleImageUrlChange}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                />
                
                {user?.foto && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Foto do Google disponível. Clique em "Usar foto do Google" para aplicá-la.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Aplicando foto do Google:', user.foto);
                        setFormData(prev => ({ ...prev, foto: user.foto }));
                        setImagePreview(user.foto);
                      }}
                    >
                      Usar foto do Google
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.especialidades.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveSpecialty(specialty)}
                    />
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Digite uma especialidade"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                />
                <Button 
                  type="button" 
                  onClick={handleAddSpecialty}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Sugestões:</Label>
                <div className="flex flex-wrap gap-2">
                  {commonSpecialties
                    .filter(s => !formData.especialidades.includes(s))
                    .map((specialty) => (
                      <Badge 
                        key={specialty}
                        variant="outline" 
                        className="cursor-pointer hover:bg-green-50"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            especialidades: [...formData.especialidades, specialty]
                          });
                        }}
                      >
                        + {specialty}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidade */}
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Informações sobre sua disponibilidade</Label>
                <Textarea
                  name="agenda_disponibilidade"
                  value={formData.agenda_disponibilidade || ''}
                  onChange={handleChange}
                  placeholder="Ex: Disponível de segunda a sexta, das 8h às 18h. Atendimento presencial e online. Urgências podem ser atendidas nos finais de semana."
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  Esta informação será usada pelo sistema para fazer agendamentos adequados.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="agro-gradient text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

