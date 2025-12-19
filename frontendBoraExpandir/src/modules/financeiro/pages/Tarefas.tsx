import { TaskModule } from '@/modules/shared/components/TaskModule';

export function Tarefas() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Minhas Tarefas (Financeiro)</h1>
            {/* Simulating logged in user: Ana Souza */}
            <TaskModule currentUser="Ana Souza" />
        </div>
    );
}
