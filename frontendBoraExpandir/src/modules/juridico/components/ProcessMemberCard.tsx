import { User, ChevronRight } from "lucide-react";
import { Badge } from '../../../components/ui/Badge';
import { Button } from "./ui/button";

interface ProcessMemberCardProps {
    member: {
        id: string;
        name: string;
        type: string;
        docs: number;
        waitingAction: number;
        analyzing: number;
        completed: number;
    };
    onClick: () => void;
}

export function ProcessMemberCard({ member, onClick }: ProcessMemberCardProps) {
    return (
        <div 
            className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all hover:bg-muted/30 cursor-pointer group"
            onClick={onClick}
        >
            {/* Column 1: Icon & Name */}
            <div className="col-span-4 flex items-center gap-4 text-left">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{member.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{member.docs} Documentos no total</p>
                </div>
            </div>

            {/* Column 2: Parentesco/Type */}
            <div className="col-span-2 text-center">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0.5 px-2 bg-background/50 border-gray-200">
                    {member.type}
                </Badge>
            </div>

            {/* Column 3: Document Status */}
            <div className="col-span-4">
                <div className="grid grid-cols-3 gap-2 text-[10px] text-center max-w-[280px] mx-auto">
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-1 rounded border border-amber-100/50">
                        <span className="block font-black text-amber-600 text-xs">{member.waitingAction}</span>
                        <span className="text-muted-foreground uppercase opacity-60">Aguardam</span>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-1 rounded border border-blue-100/50">
                        <span className="block font-black text-blue-600 text-xs">{member.analyzing}</span>
                        <span className="text-muted-foreground uppercase opacity-60">Análise</span>
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-900/10 p-1 rounded border border-green-100/50">
                        <span className="block font-black text-green-600 text-xs">{member.completed}</span>
                        <span className="text-muted-foreground uppercase opacity-60">Feito</span>
                    </div>
                </div>
            </div>

            {/* Column 4: Ações */}
            <div className="col-span-2 flex justify-center">
                <Button 
                    className="w-full max-w-[140px] bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none justify-between h-8 rounded-xl text-[10px] font-bold shadow-sm transition-all group-hover:translate-x-1"
                >
                    Ver Documentos
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
