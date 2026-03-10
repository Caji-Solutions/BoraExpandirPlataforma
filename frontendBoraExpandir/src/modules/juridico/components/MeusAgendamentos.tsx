import { useState, useEffect } from "react";
import { 
  Calendar, 
  Search, 
  Loader2, 
  AlertCircle, 
  Clock, 
  User, 
  Briefcase,
  Filter,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import juridicoService from "../services/juridicoService";
import { Badge } from "../../../components/ui/Badge";
import { formatDate } from "../../cliente/lib/utils";

type TabType = 'consultorias' | 'assessorias';

export function MeusAgendamentos() {
  const { activeProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('consultorias');
  const [consultorias, setConsultorias] = useState<any[]>([]);
  const [assessorias, setAssessorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'consultorias') {
          const data = await juridicoService.getAgendamentos();
          setConsultorias(Array.isArray(data) ? data : []);
        } else if (activeTab === 'assessorias' && activeProfile?.id) {
          const data = await juridicoService.getAssessoriasByResponsavel(activeProfile.id);
          setAssessorias(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        console.error("Erro ao carregar agendamentos:", err);
        setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, activeProfile?.id]);

  const filteredData = (activeTab === 'consultorias' ? consultorias : assessorias).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'consultorias') {
      return (
        item.nome?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.produto_nome?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        item.clientes?.nome?.toLowerCase().includes(searchLower) ||
        item.clientes?.email?.toLowerCase().includes(searchLower) ||
        item.observacoes?.toLowerCase().includes(searchLower)
      );
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
      case 'confirmado':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Confirmado</Badge>;
      case 'pendente':
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Agendado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Agendamentos</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas consultorias e assessorias jurídicas.</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-xl border shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('consultorias')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'consultorias' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Consultorias
          </button>
          <button
            onClick={() => setActiveTab('assessorias')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'assessorias' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Assessorias
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={`Buscar em ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground">Carregando seus agendamentos...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800">Ops! Algo deu errado</h3>
          <p className="text-red-600 mt-1 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100"
          >
            Tentar Novamente
          </button>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    {activeTab === 'consultorias' ? <Calendar className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
                  </div>
                  {getStatusBadge(activeTab === 'consultorias' ? item.status : 'Aprovado')}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {activeTab === 'consultorias' ? item.produto_nome : (item.servico_nome || 'Assessoria Jurídica')}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 font-medium">
                      <User className="h-3.5 w-3.5" />
                      {activeTab === 'consultorias' ? item.nome : (item.clientes?.nome || 'Cliente não identificado')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 py-4 border-y border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      {item.data_hora 
                        ? formatDate(item.data_hora)
                        : item.criado_em ? formatDate(item.criado_em) : 'Data indisponível'
                      }
                    </div>
                    {(item.email || item.clientes?.email) && (
                      <div className="text-xs text-gray-400 truncate">
                        {item.email || item.clientes?.email}
                      </div>
                    )}
                  </div>

                  {item.observacoes && (
                    <p className="text-sm text-gray-600 line-clamp-2 italic">
                      "{item.observacoes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-bold py-0.5">
                  ID: {item.id.substring(0, 8)}
                </Badge>
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                  title="Ver detalhes"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed rounded-3xl p-20 text-center flex flex-col items-center justify-center">
          <div className="p-6 bg-white rounded-full shadow-sm mb-6 border border-gray-100">
            <Filter className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Nenhum registro encontrado</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Não encontramos nenhum {activeTab === 'consultorias' ? 'agendamento' : 'assessoria'} com os critérios atuais.
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-6 text-blue-600 font-bold hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MeusAgendamentos;
