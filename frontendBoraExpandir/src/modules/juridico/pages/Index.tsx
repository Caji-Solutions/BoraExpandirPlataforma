import { useState } from "react";
import { FolderOpen, Star, AlertCircle, Video, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Badge } from '../../../components/ui/Badge';

const kpiData = [
  {
    title: "Processos Abertos",
    value: "124",
    icon: FolderOpen,
    colorClass: "bg-kpi-blue-bg border-kpi-blue text-kpi-blue",
  },
  {
    title: "Novos (Mês)",
    value: "12",
    icon: Star,
    colorClass: "bg-kpi-yellow-bg border-kpi-yellow text-kpi-yellow",
  },
  {
    title: "Compromissos Hoje",
    value: "5",
    icon: AlertCircle,
    colorClass: "bg-kpi-red-bg border-kpi-red text-kpi-red",
  },
];

const urgentTasks = [
  {
    id: 1,
    title: "Reunião Cliente João Silva",
    time: "14:00",
    tag: "Videoconferência",
    icon: Video,
    variant: "default" as const,
  },
  {
    id: 2,
    title: "Prazo Visto D7 - Maria Souza",
    time: "Vence Hoje",
    tag: "Urgente",
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
];

export default function Index() {
  const [notes, setNotes] = useState<string[]>(Array(6).fill(""));

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = value;
    setNotes(newNotes);
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral - Jurídico</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas métricas e prioridades do dia</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className={`border-2 ${kpi.colorClass}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{kpi.title}</p>
                  <p className="text-4xl font-bold mt-2">{kpi.value}</p>
                </div>
                <kpi.icon className="h-12 w-12 opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Anotações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {notes.map((note, index) => (
                <Textarea
                  key={index}
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder={`Nota ${index + 1}...`}
                  className="min-h-[100px] bg-kpi-yellow-bg border-kpi-yellow/30 focus:border-kpi-yellow resize-none"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Prioridades do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-md bg-primary/10">
                  <task.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{task.time}</p>
                  <Badge variant={task.variant} className="mt-2">
                    {task.tag}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
