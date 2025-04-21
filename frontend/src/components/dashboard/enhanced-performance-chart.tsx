import { Activity, Deal, Performance } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { formatDate } from "@/lib/utils";

interface EnhancedPerformanceChartProps {
  activities: Activity[];
  deals: Deal[];
  performances: Performance[];
  isLoading: boolean;
  className?: string;
}

export default function EnhancedPerformanceChart({ activities, deals, performances, isLoading, className }: EnhancedPerformanceChartProps) {
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

  // Process performance trend data
  const performanceTrendData = performances
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
    .map(perf => ({
      name: formatDate(perf.weekStart).split('/').slice(0, 2).join('/'),
      pontuação: perf.score,
      atividades: perf.activitiesCompleted,
      negociações: perf.dealsProgressed,
    }));

  // Process team performance radar data
  const teamPerformanceData = [
    { subject: 'Atividades', A: 120, B: 110, C: 90, D: 60, fullMark: 150 },
    { subject: 'Negociações', A: 98, B: 130, C: 75, D: 85, fullMark: 150 },
    { subject: 'Conversões', A: 86, B: 130, C: 70, D: 60, fullMark: 150 },
    { subject: 'Clientes', A: 99, B: 100, C: 65, D: 85, fullMark: 150 },
    { subject: 'Pontuação', A: 85, B: 90, C: 65, D: 70, fullMark: 150 },
  ];

  // Custom label for pie charts
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
        <CardTitle>Análise Avançada de Desempenho</CardTitle>
        <CardDescription>Visualização detalhada e tendências de produtividade</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue="trend">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trend">Tendências</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="deals">Negociações</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trend" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceTrendData}
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
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pontuação" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="atividades" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="negociações" stackId="3" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="activities" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityStatusData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value: any) => [`${value} atividades`, ""]} />
                      <Bar dataKey="value" fill="#8884d8">
                        {activityStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="deals" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceTrendData}
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
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="negociações" stroke="#ffc658" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="pontuação" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar name="Ana" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Carlos" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="Márcia" dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="Roberto" dataKey="D" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 