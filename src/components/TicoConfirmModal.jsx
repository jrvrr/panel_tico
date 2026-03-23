import React from 'react';
import { AlertCircle, HelpCircle, CheckCircle, X } from 'lucide-react';
import './TicoConfirmModal.css';

/**
 * TicoConfirmModal - A premium reusable confirmation modal.
 * 
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {function} onConfirm - Callback when user confirms.
 * @param {function} onCancel - Callback when user cancels/closes.
 * @param {string} title - The main question/title.
 * @param {string} message - Descriptive text (e.g. "You are about to cancel...").
 * @param {string} confirmText - Label for the primary action button.
 * @param {string} cancelText - Label for the secondary action button.
 * @param {string} type - 'danger' (red), 'warning' (yellow), 'success' (green), 'info' (blue).
 */
const TicoConfirmModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title = '¿Estás seguro?',
    message = 'Esta acción no siempre se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle className="tico-confirm-icon-danger" size={48} />;
            case 'warning': return <AlertCircle className="tico-confirm-icon-warning" size={48} />;
            case 'success': return <CheckCircle className="tico-confirm-icon-success" size={48} />;
            default: return <HelpCircle className="tico-confirm-icon-info" size={48} />;
        }
    };

    return (
        <div className="tico-modal-overlay tico-confirm-overlay" onClick={onCancel}>
            <div className="tico-modal tico-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <button className="tico-modal-close" onClick={onCancel}>
                    <X size={18} />
                </button>

                <div className="tico-confirm-content">
                    <div className="tico-confirm-icon-wrapper">
                        {getIcon()}
                    </div>
                    
                    <h2 className="tico-confirm-title">{title}</h2>
                    <p className="tico-confirm-message">{message}</p>
                </div>

                <div className="tico-confirm-actions">
                    <button 
                        className="tico-btn tico-btn-outline tico-confirm-btn" 
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`tico-btn tico-btn-primary tico-confirm-btn ${type === 'danger' ? 'tico-btn-danger' : ''}`} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicoConfirmModal;
