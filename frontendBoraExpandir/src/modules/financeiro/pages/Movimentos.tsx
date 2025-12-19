import { MovementModule } from '@/modules/shared/components/MovementModule';

export function Movimentos() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Extrato de Movimentos</h1>
            <MovementModule />
        </div>
    );
}
