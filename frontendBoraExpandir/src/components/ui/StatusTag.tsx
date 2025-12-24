import React from 'react';
import './StatusTag.css';

interface StatusTagProps {
    /**
     * Texto a ser exibido na tag de status
     */
    label: string;

    /**
     * Cor de fundo da tag (pode ser hex, rgb, ou nome de cor CSS)
     * Exemplos: "#4CAF50", "rgb(76, 175, 80)", "green"
     */
    color: string;

    /**
     * Tamanho da tag (opcional)
     * @default "medium"
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Classe CSS adicional (opcional)
     */
    className?: string;
}

/**
 * Componente StatusTag - Tag de status padronizada para toda a plataforma
 * 
 * @example
 * <StatusTag label="Ativo" color="#4CAF50" />
 * <StatusTag label="Pendente" color="#FFA726" size="small" />
 * <StatusTag label="Cancelado" color="#EF5350" size="large" />
 */
const StatusTag: React.FC<StatusTagProps> = ({
    label,
    color,
    size = 'medium',
    className = ''
}) => {
    return (
        <span
            className={`status-tag status-tag--${size} ${className}`}
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
};

export default StatusTag;
