import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CommissionSubmission } from '@/types';

interface ActionsMenuProps {
  submission: CommissionSubmission;
  isManager: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canMarkAsPaid: boolean;
  canViewPaymentReceipt: boolean;
  isDeleting: boolean;
  onReview: () => void;
  onMarkAsPaid: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewPDF: () => void;
  onViewPaymentReceipt: () => void;
}

const ActionsMenu = ({
  submission,
  isManager,
  canEdit,
  canDelete,
  canMarkAsPaid,
  canViewPaymentReceipt,
  isDeleting,
  onReview,
  onMarkAsPaid,
  onEdit,
  onDelete,
  onViewPDF,
  onViewPaymentReceipt,
}: ActionsMenuProps) => {
  // Icon button style - compact with icons only
  const iconButtonClass = "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors";
  
  // Show icon buttons for common actions, dropdown for rest
  return (
    <div className="flex items-center gap-1">
      {/* View PDF - Always visible */}
      <button
        onClick={onViewPDF}
        className={iconButtonClass}
        title={submission.document_type === 'factura' ? 'Ver Factura' : 'Ver Orden de Compra'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Review - For manager on non-paid submissions */}
      {isManager && submission.status !== 'paid' && (
        <button
          onClick={onReview}
          className="p-1.5 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
          title="Revisar Solicitud"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      {/* Mark as Paid - For approved submissions */}
      {canMarkAsPaid && (
        <button
          onClick={onMarkAsPaid}
          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
          title="Marcar como Pagado"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      )}

      {/* View Payment Receipt - For paid submissions */}
      {canViewPaymentReceipt && (
        <button
          onClick={onViewPaymentReceipt}
          className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
          title="Ver Comprobante de Pago"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {/* Dropdown for edit/delete */}
      {(canEdit || canDelete) && (
        <Menu as="div" className="relative">
          <Menu.Button className={iconButtonClass}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                {canEdit && (
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={onEdit}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center`}
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    )}
                  </Menu.Item>
                )}
                
                {canDelete && (
                  <>
                    {canEdit && <div className="border-t border-gray-100"></div>}
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={onDelete}
                          disabled={isDeleting}
                          className={`${
                            active ? 'bg-red-50' : ''
                          } w-full text-left px-4 py-2 text-sm text-red-600 flex items-center disabled:opacity-50`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      )}
                    </Menu.Item>
                  </>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  );
};

export default ActionsMenu;