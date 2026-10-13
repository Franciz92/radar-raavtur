// src/components/service/ServiceActionButton.jsx
import { Calendar, ShoppingCart, Ticket, PenTool, Wrench, Handshake } from 'lucide-react';
import { getServiceAction } from '../../utils/serviceActions';

const ICONS = {
  Calendar,
  ShoppingCart,
  Ticket,
  PenTool,
  Wrench,
  Handshake,
};

export default function ServiceActionButton({ 
  category, 
  language = 'pt', 
  onClick, 
  className = '',
  disabled = false,
}) {
  const { label, icon } = getServiceAction(category, language);
  const Icon = ICONS[icon] || Calendar;
  
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}