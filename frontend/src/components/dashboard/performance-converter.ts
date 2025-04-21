import { Performance } from "@shared/schema";

export interface PerformerProps {
  brokerId: number;
  brokerName: string;
  brokerInitials: string;
  score: number;
  activitiesCompleted: number;
}

// Mock dos nomes dos corretores, em uma implementação real seria buscado do banco de dados
const BROKER_NAMES: Record<number, { name: string, initials: string }> = {
  2: { name: "Ana Rodrigues", initials: "AR" },
  3: { name: "Carlos Silva", initials: "CS" },
  4: { name: "Márcia Gomes", initials: "MG" },
  5: { name: "Roberto Costa", initials: "RC" },
  6: { name: "Lucia Pereira", initials: "LP" }
};

/**
 * Converte um array de Performance para o formato de PerformerProps
 * Para uso com o componente PerformanceCard
 */
export function convertPerformancesToPerformerProps(performances: Performance[]): PerformerProps[] {
  if (!performances || performances.length === 0) {
    return [];
  }
  
  return performances.map(perf => {
    const brokerInfo = BROKER_NAMES[perf.userId] || { 
      name: `Corretor #${perf.userId}`, 
      initials: `C${perf.userId}` 
    };
    
    return {
      brokerId: perf.userId,
      brokerName: brokerInfo.name,
      brokerInitials: brokerInfo.initials,
      score: perf.score,
      activitiesCompleted: perf.activitiesCompleted
    };
  });
} 