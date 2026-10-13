// src/components/QRCodeGenerator.jsx

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGenerator({ 
  data, 
  size = 150, 
  color = '#7c3aed',
  bgColor = '#ffffff'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        height: size,
        color: {
          dark: color,
          light: bgColor
        },
        errorCorrectionLevel: 'H',
        margin: 2
      }, (error) => {
        if (error) console.error('Erro ao gerar QR Code:', error);
      });
    }
  }, [data, size, color, bgColor]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: size, 
        height: size,
        imageRendering: 'pixelated'
      }}
    />
  );
}