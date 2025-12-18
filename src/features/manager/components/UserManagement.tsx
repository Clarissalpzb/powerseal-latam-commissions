import { useState } from 'react';
import { User } from '@/types';

interface PendingInvite {
  id: string;
  email: string;
  full_name: string;
  commission_rate: number;
  invited_at: string;
  expires_at: string;
  invited_by: string;
}

const UserManagement = () => {
  // Current active users (Roberto only for now)
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'roberto.cosio@company.com',
      full_name: 'Roberto Cosio',
      role: 'salesperson',
      commission_rate: 0.03,
      employee_id: 'EMP001',
      is_active: true,
      is_approved: true,
      created_at: '2024-01-15T10:00:00Z',
    },
  ]);

  // Pending invites
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: 'invite-1',
      email: 'maria.gonzalez@company.com',
      full_name: 'Maria González',
      commission_rate: 0.035,
      invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      invited_by: 'Manager',
    },
  ]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendInvite = async (inviteData: {
    email: string;
    fullName: string;
    commissionRate: number;
  }) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newInvite: PendingInvite = {
        id: `invite-${Date.now()}`,
        email: inviteData.email,
        full_name: inviteData.fullName,
        commission_rate: inviteData.commissionRate / 100, // Convert percentage to decimal
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        invited_by: 'Manager',
      };

      setPendingInvites([...pendingInvites, newInvite]);
      setShowInviteForm(false);
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPendingInvites(pendingInvites.map(invite => 
        invite.id === inviteId 
          ? { 
              ...invite, 
              invited_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          : invite
      ));
    } catch (error) {
      console.error('Failed to resend invite:', error);
    }
  };

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
  };

  const handleDeactivateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, is_active: !user.is_active }
        : user
    ));
  };

  const handleUpdateCommissionRate = (userId: string, newRate: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, commission_rate: newRate }
        : user
    ));
    setEditingUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Expirada';
    if (diffInHours < 24) return `${diffInHours}h restantes`;
    return `${Math.floor(diffInHours / 24)}d restantes`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Invita vendedores y gestiona sus tasas de comisión</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="btn-primary flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Enviar Invitación
        </button>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Invitaciones Pendientes ({pendingInvites.length})
            </h3>
            <div className="text-sm text-gray-500">
              Las invitaciones expiran en 7 días
            </div>
          </div>
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const timeLeft = getTimeUntilExpiry(invite.expires_at);
              const isExpired = timeLeft === 'Expirada';
              
              return (
                <div key={invite.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  isExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invite.full_name}</p>
                        <p className="text-sm text-gray-500">{invite.email}</p>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {(invite.commission_rate * 100).toFixed(1)}% comisión
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>Enviado {formatDate(invite.invited_at)}</span>
                      <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isExpired ? (
                      <>
                        <button
                          onClick={() => handleResendInvite(invite.id)}
                          className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Reenviar
                        </button>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleResendInvite(invite.id)}
                        className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Renovar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Users */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Vendedores Activos ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Empleado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa de Comisión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Ingreso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {user.employee_id || '-'}
                  </td>
                  <td className="px-4 py-4">
                    {editingUser?.id === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="1"
                          defaultValue={user.commission_rate}
                          className="w-20 text-sm input"
                          onBlur={(e) => handleUpdateCommissionRate(user.id, parseFloat(e.target.value))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateCommissionRate(user.id, parseFloat(e.currentTarget.value));
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                      >
                        {((user.commission_rate || 0) * 100).toFixed(1)}%
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.is_active ? (
                      <span className="status-approved">Activo</span>
                    ) : (
                      <span className="status-rejected">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDeactivateUser(user.id)}
                      className={`text-sm font-medium ${
                        user.is_active 
                          ? "text-red-600 hover:text-red-900" 
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Invite Modal */}
      {showInviteForm && (
        <InviteUserModal
          isOpen={showInviteForm}
          onClose={() => setShowInviteForm(false)}
          onSubmit={handleSendInvite}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Invite User Modal Component
interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    fullName: string;
    commissionRate: number;
  }) => void;
  isSubmitting: boolean;
}

const InviteUserModal = ({ isOpen, onClose, onSubmit, isSubmitting }: InviteUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    commissionRate: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commissionRate' ? parseFloat(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Enviar Invitación</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="input w-full"
              required
              placeholder="Ej: María González"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input w-full"
              required
              placeholder="maria.gonzalez@company.com"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tasa de Comisión (%) *
            </label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleInputChange}
              className="input w-full"
              step="0.1"
              min="0"
              max="100"
              required
              placeholder="3.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje de comisión que recibirá este vendedor
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Proceso de invitación:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Se enviará un email con enlace de registro</li>
                  <li>• El enlace expira en 7 días</li>
                  <li>• El usuario creará su cuenta y tendrá acceso inmediato</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.email || !formData.fullName}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar Invitación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;