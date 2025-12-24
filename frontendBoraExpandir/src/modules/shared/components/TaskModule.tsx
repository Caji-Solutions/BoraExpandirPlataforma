import { useState } from "react";
import { Eye, Calendar, User } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface Task {
    id: string;
    tarefa: string;
    cliente: string;
    dataHora: string;
    status: "Pendente" | "Em Andamento" | "Concluído" | "Atrasado";
    observacao: string;
    responsavel: string;
    realizado: boolean;
}

const initialTasks: Task[] = [
    {
        id: "1",
        tarefa: "Envio de Documento",
        cliente: "ROGERIO ESTEVES DA SILVA",
        dataHora: "18/08/2025 00:00:00",
        status: "Atrasado",
        observacao: "Observação",
        responsavel: "Ana Souza",
        realizado: false,
    },
    {
        id: "2",
        tarefa: "Análise de Contrato",
        cliente: "Maria Oliveira",
        dataHora: "20/08/2025 14:00:00",
        status: "Em Andamento",
        observacao: "Verificar cláusula 3",
        responsavel: "Carlos Lima",
        realizado: false,
    },
    {
        id: "3",
        tarefa: "Reunião de Alinhamento",
        cliente: "Tech Solutions",
        dataHora: "21/08/2025 10:00:00",
        status: "Pendente",
        observacao: "Videochamada",
        responsavel: "Ana Souza",
        realizado: false,
    },
    {
        id: "4",
        tarefa: "Protocolo de Petição",
        cliente: "João Silva",
        dataHora: "15/08/2025 09:30:00",
        status: "Concluído",
        observacao: "Protocolado no sistema",
        responsavel: "Carlos Lima",
        realizado: true,
    },
];

interface TaskModuleProps {
    currentUser?: string;
}

export function TaskModule({ currentUser }: TaskModuleProps) {
    const [filterText, setFilterText] = useState("");
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const toggleTask = (taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, realizado: !t.realizado } : t
        ));
    };

    // Filter tasks by current user (if provided) and local text filter
    const filteredTasks = tasks.filter((task) => {
        const matchesUser = currentUser ? task.responsavel === currentUser : true;
        const matchesText =
            task.tarefa.toLowerCase().includes(filterText.toLowerCase()) ||
            task.cliente.toLowerCase().includes(filterText.toLowerCase());
        return matchesUser && matchesText;
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Tabela de Tarefas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 border-b">
                    <Input
                        placeholder="Filtrar tarefas..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <div className="flex items-center justify-center">
                                        <CheckSquareIcon className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Tarefa</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Data e Hora</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Observação</TableHead>
                                <TableHead>Responsável</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.map((task) => (
                                <TableRow key={task.id} className="hover:bg-muted/50">
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={task.realizado}
                                            onCheckedChange={() => toggleTask(task.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{task.tarefa}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {task.cliente}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {task.dataHora}
                                    </TableCell>
                                    <TableCell>
                                        {task.status === "Atrasado" && (
                                            <Badge variant="destructive">Atrasado</Badge>
                                        )}
                                        {task.status === "Em Andamento" && (
                                            <Badge variant="default">Em Andamento</Badge>
                                        )}
                                        {task.status === "Pendente" && (
                                            <Badge variant="warning">Pendente</Badge>
                                        )}
                                        {task.status === "Concluído" && (
                                            <Badge variant="success">Concluído</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{task.observacao}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {task.responsavel}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        Nenhuma tarefa encontrada para este usuário.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

// Icon helper
function CheckSquareIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    )
}
