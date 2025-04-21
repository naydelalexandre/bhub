import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Agora';
  } else if (diffInMinutes < 60) {
    return `Há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInHours < 24) {
    return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays < 2) {
    return 'Ontem';
  } else if (diffInDays < 7) {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return weekdays[d.getDay()];
  } else {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = formatDate(d);
  const formattedTime = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${formattedDate}, ${formattedTime}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('');
}

export function translateDealStage(stage: string): string {
  const stages: Record<string, string> = {
    'initial_contact': 'Contato Inicial',
    'visit': 'Visita',
    'proposal': 'Proposta',
    'closing': 'Fechamento'
  };
  return stages[stage] || stage;
}

export function translateActivityStatus(status: string): string {
  const statuses: Record<string, string> = {
    'pending': 'Pendente',
    'in_progress': 'Em andamento',
    'completed': 'Concluída'
  };
  return statuses[status] || status;
}

export function translateNotificationType(type: string): string {
  const types: Record<string, string> = {
    'message': 'Mensagem',
    'activity': 'Atividade',
    'deal': 'Negociação',
    'performance': 'Performance',
    'reminder': 'Lembrete'
  };
  return types[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': 'bg-neutral-200 text-neutral-300',
    'in_progress': 'bg-primary/10 text-primary',
    'completed': 'bg-secondary/10 text-secondary',
    'initial_contact': 'bg-neutral-200 text-neutral-300',
    'visit': 'bg-accent/10 text-accent',
    'proposal': 'bg-primary/10 text-primary',
    'closing': 'bg-secondary/10 text-secondary',
    'low': 'text-neutral-300',
    'medium': 'text-accent',
    'high': 'text-secondary',
  };
  return colors[status] || 'bg-neutral-200 text-neutral-300';
}

export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    'message': 'chat',
    'activity': 'assignment',
    'deal': 'handshake',
    'performance': 'leaderboard',
    'reminder': 'calendar_today'
  };
  return icons[type] || 'notifications';
}

export function getNotificationIconColor(type: string): string {
  const colors: Record<string, string> = {
    'message': 'bg-primary/10 text-primary',
    'activity': 'bg-accent/10 text-accent',
    'deal': 'bg-primary/10 text-primary',
    'performance': 'bg-secondary/10 text-secondary',
    'reminder': 'bg-primary/10 text-primary'
  };
  return colors[type] || 'bg-neutral-200 text-neutral-300';
}
