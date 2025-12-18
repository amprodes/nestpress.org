import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, Info, CheckCircle, HelpCircle } from 'lucide-react';

export type ModalType = 'confirm' | 'alert' | 'info' | 'prompt';

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
}

interface ModalConfig {
  title: string;
  message: string;
  type?: ModalType;
  buttons?: ModalButton[];
  onClose?: () => void;
  showCloseButton?: boolean;
  icon?: 'warning' | 'info' | 'success' | 'question' | null;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'primary' | 'info';
}

interface AlertOptions {
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  confirm: (optionsOrMessage: ConfirmOptions | string, title?: string) => Promise<boolean>;
  alert: (optionsOrMessage: AlertOptions | string, title?: string) => Promise<void>;
  prompt: (message: string, title?: string, defaultValue?: string) => Promise<string | null>;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [resolver, setResolver] = useState<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const showModal = useCallback((modalConfig: ModalConfig) => {
    setConfig(modalConfig);
    setIsOpen(true);
    setInputValue('');
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (config?.onClose) {
      config.onClose();
    }
    // Clear after animation
    setTimeout(() => {
      setConfig(null);
      if (resolver) {
        resolver.resolve(false);
        setResolver(null);
      }
    }, 200);
  }, [config, resolver]);

  const confirm = useCallback((optionsOrMessage: ConfirmOptions | string, fallbackTitle?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Support both object and string API
      const options: ConfirmOptions = typeof optionsOrMessage === 'string' 
        ? { message: optionsOrMessage, title: fallbackTitle }
        : optionsOrMessage;

      const title = options.title || 'Confirm';
      const message = options.message;
      const confirmText = options.confirmText || 'Confirm';
      const cancelText = options.cancelText || 'Cancel';
      const iconMap = { warning: 'warning', danger: 'warning', primary: 'question', info: 'info' };
      const icon = iconMap[options.variant || 'primary'] as 'warning' | 'info' | 'success' | 'question';
      
      setResolver({ resolve, reject: () => resolve(false) });
      showModal({
        title,
        message,
        type: 'confirm',
        icon,
        buttons: [
          {
            label: cancelText,
            onClick: () => {
              resolve(false);
              closeModal();
            },
            variant: 'secondary',
          },
          {
            label: confirmText,
            onClick: () => {
              resolve(true);
              closeModal();
            },
            variant: options.variant === 'warning' || options.variant === 'danger' ? 'danger' : 'primary',
          },
        ],
        showCloseButton: true,
      });
    });
  }, [showModal, closeModal]);

  const alert = useCallback((optionsOrMessage: AlertOptions | string, fallbackTitle?: string): Promise<void> => {
    return new Promise((resolve) => {
      // Support both object and string API
      const options: AlertOptions = typeof optionsOrMessage === 'string'
        ? { message: optionsOrMessage, title: fallbackTitle }
        : optionsOrMessage;

      const title = options.title || 'Notice';
      const message = options.message;
      const iconMap = { success: 'success', error: 'warning', warning: 'warning', info: 'info' };
      const icon = iconMap[options.variant || 'info'] as 'warning' | 'info' | 'success' | 'question';

      setResolver({ resolve, reject: () => resolve() });
      showModal({
        title,
        message,
        type: 'alert',
        icon,
        buttons: [
          {
            label: 'OK',
            onClick: () => {
              resolve();
              closeModal();
            },
            variant: 'primary',
          },
        ],
        showCloseButton: true,
      });
    });
  }, [showModal, closeModal]);

  const prompt = useCallback((message: string, title: string = 'Input Required', defaultValue: string = ''): Promise<string | null> => {
    setInputValue(defaultValue);
    return new Promise((resolve) => {
      setResolver({ resolve, reject: () => resolve(null) });
      showModal({
        title,
        message,
        type: 'prompt',
        icon: null,
        buttons: [
          {
            label: 'Cancel',
            onClick: () => {
              resolve(null);
              closeModal();
            },
            variant: 'secondary',
          },
          {
            label: 'OK',
            onClick: () => {
              resolve(inputValue);
              closeModal();
            },
            variant: 'primary',
          },
        ],
        showCloseButton: true,
      });
    });
  }, [showModal, closeModal, inputValue]);

  const getIcon = () => {
    if (!config?.icon) return null;
    
    const iconProps = { size: 48, className: 'mx-auto mb-4' };
    
    switch (config.icon) {
      case 'warning':
        return <AlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'info':
        return <Info {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'success':
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case 'question':
        return <HelpCircle {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      default:
        return null;
    }
  };

  const getButtonStyle = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'secondary':
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  return (
    <ModalContext.Provider value={{ showModal, confirm, alert, prompt, closeModal }}>
      {children}
      
      {/* Modal Overlay - only render when open */}
      {isOpen && config && (
        <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={config.showCloseButton ? closeModal : undefined}
      >
        {/* Modal Container */}
        <div
          className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
            {config.showCloseButton && (
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{config.message}</p>
            
            {/* Input for prompt type */}
            {config.type === 'prompt' && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mt-4 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && config.buttons) {
                    // Trigger primary button (usually OK)
                    const primaryButton = config.buttons.find(b => b.variant === 'primary');
                    if (primaryButton) primaryButton.onClick();
                  }
                }}
              />
            )}
          </div>

          {/* Footer with Buttons */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {config.buttons?.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`px-4 py-2 rounded font-medium transition-colors ${getButtonStyle(button.variant)}`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ModalContext.Provider>
  );
};
