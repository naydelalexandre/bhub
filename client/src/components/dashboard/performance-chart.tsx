import { Activity, Deal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { translateDealStage, translateActivityStatus } from "@/lib/utils";

interface PerformanceChartProps {
  activities: Activity[];
  deals: Deal[];
  isLoading: boolean;
  className?: string;
}

export default function PerformanceChart({ activities, deals, isLoading, className }: PerformanceChartProps) {
  // Process activities data by status
  const activityStatusData = [
    { name: "Pendentes", value: activities.filter(a => a.status === "pending").length, color: "#94a3b8" },
    { name: "Em Andamento", value: activities.filter(a => a.status === "in_progress").length, color: "#3b82f6" },
    { name: "Concluídas", value: activities.filter(a => a.status === "completed").length, color: "#10b981" },
  ];

  // Process deals data by stage
  const dealStageData = [
    { name: "Contato Inicial", value: deals.filter(d => d.stage === "initial_contact").length, color: "#94a3b8" },
    { name: "Visita", value: deals.filter(d => d.stage === "visit").length, color: "#f59e0b" },
    { name: "Proposta", value: deals.filter(d => d.stage === "proposal").length, color: "#3b82f6" },
    { name: "Fechamento", value: deals.filter(d => d.stage === "closing").length, color: "#10b981" },
  ];

  // Process deals data by priority
  const dealPriorityData = [
    { name: "Baixa", value: deals.filter(d => d.priority === "low").length, color: "#94a3b8" },
    { name: "Média", value: deals.filter(d => d.priority === "medium").length, color: "#f59e0b" },
    { name: "Alta", value: deals.filter(d => d.priority === "high").length, color: "#ef4444" },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Análise de Desempenho</CardTitle>
        <CardDescription>Visualização detalhada de atividades e negociações</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue="activities">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="deals-stage">Negociações por Fase</TabsTrigger>
              <TabsTrigger value="deals-priority">Negociações por Prioridade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} atividades`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="deals-stage" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dealStageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value} negociações`, ""]} />
                    <Bar dataKey="value" name="Negociações">
                      {dealStageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="deals-priority" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealPriorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dealPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} negociações`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}