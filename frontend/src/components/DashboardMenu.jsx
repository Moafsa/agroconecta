import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  CreditCard, 
  Award,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardMenu = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: User,
      path: '/profile',
      badge: null
    },
    {
      id: 'verification',
      label: 'Verificação',
      icon: Award,
      path: '/verificacao',
      badge: user?.status_verificacao === 'PENDENTE' ? 'Pendente' : null
    },
    {
      id: 'invoices',
      label: 'Faturas',
      icon: FileText,
      path: '/faturas',
      badge: null
    },
    {
      id: 'subscription',
      label: 'Assinatura',
      icon: CreditCard,
      path: '/subscription',
      badge: user?.status_assinatura === 'PENDENTE' ? 'Pendente' : null
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Menu lateral */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Agro-Conecta</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`
                  w-full justify-start h-auto p-3
                  ${isActive(item.path) 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  navigate(item.path);
                  onToggle(); // Fechar menu no mobile
                }}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
            <Badge 
              className={`
                mt-2 text-xs
                ${user?.status_assinatura === 'ATIVO' 
                  ? 'bg-green-100 text-green-800' 
                  : user?.status_assinatura === 'PENDENTE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
                }
              `}
            >
              {user?.status_assinatura}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardMenu;
