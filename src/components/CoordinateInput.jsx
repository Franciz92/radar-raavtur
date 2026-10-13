// src/components/CoordinateInput.jsx
import React, { useState } from 'react';

const CoordinateInput = ({ 
    label, 
    value, 
    onChange, 
    type, 
    placeholder,
    min,
    max,
    required 
}) => {
    const [error, setError] = useState('');
    
    const handleChange = (e) => {
        const newValue = e.target.value;
        
        // Permitir vazio
        if (newValue === '') {
            setError('');
            onChange('');
            return;
        }
        
        // Validar número
        const num = Number(newValue);
        if (isNaN(num)) {
            setError('Digite um número válido');
            onChange(newValue);
            return;
        }
        
        // Validar limites
        if (min !== undefined && num < min) {
            setError(`Valor mínimo: ${min}`);
        } else if (max !== undefined && num > max) {
            setError(`Valor máximo: ${max}`);
        } else {
            setError('');
        }
        
        onChange(newValue);
    };
    
    return (
        <div className="coordinate-input">
            <label>
                {label}
                {required && <span className="required">*</span>}
            </label>
            <input
                type="number"
                step="any"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
            <span className="hint">
                {type === 'latitude' && 'Intervalo: -90 a 90'}
                {type === 'longitude' && 'Intervalo: -180 a 180'}
            </span>
        </div>
    );
};

export default CoordinateInput;