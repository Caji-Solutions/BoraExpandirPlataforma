import { useState, useEffect } from "react";
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from "@/modules/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select';
import { Switch } from "@/modules/shared/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/modules/shared/components/ui/card';
import { Separator } from "@/modules/shared/components/ui/separator";
import {
  Plus,
  Trash2,
  GripVertical,
  Search,
  Edit2,
  MoreHorizontal,
  Clock,
  Euro,
  FileText,
  Loader2,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shared/components/ui/dialog';
import { Badge } from '@/modules/shared/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/modules/shared/components/ui/dropdown-menu';
import { catalogService, Service, Subservice, TipoPreco, DocumentRequirement } from "../../services/catalogService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContratoTemplate {
  id: string;
  nome: string;
}

// ─── Tipos de Categoria (exportados para teste) ───────────────────────────────
export type ServiceCategoria = "consultoria" | "assessoria" | "diverso";

// ─── Helpers puros (exportados para teste) ───────────────────────────────────
export function getPresetForCategoria(cat: ServiceCategoria): Partial<Omit<Service, "id">> {
  switch (cat) {
    case "consultoria":
      return { type: "agendavel", isAgendavel: true, tipoPreco: "por_contrato" };
    case "assessoria":
      return { type: "fixo", isAgendavel: false, tipoPreco: "por_contrato" };
    case "diverso":
      return { type: "diverso", isAgendavel: false };
  }
}

export function getClearedFieldsForSwitch(
  prevCat: ServiceCategoria,
  nextCat: ServiceCategoria
): Partial<Omit<Service, "id">> {
  if (prevCat === nextCat) return {};

  const transitions: Record<string, Partial<Omit<Service, "id">>> = {
    "consultoria->assessoria": { value: "", duration: "", tipoPreco: "por_contrato" },
    "consultoria->diverso":    { isAgendavel: false },
    "assessoria->consultoria": { contratoTemplateId: null, tipoPreco: "por_contrato" },
    "assessoria->diverso":     { contratoTemplateId: null },
    "diverso->consultoria":    { isAgendavel: true, contratoTemplateId: null },
    "diverso->assessoria":     { value: "", duration: "", tipoPreco: "por_contrato" },
  };

  return transitions[`${prevCat}->${nextCat}`] ?? {};
}

export default function ServiceCatalog() {
  const { token } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Section collapse
  const [servicesExpanded, setServicesExpanded] = useState(true);

  // Service Dialog
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Contrato templates
  const [contratoTemplates, setContratoTemplates] = useState<ContratoTemplate[]>([]);

  // Warning dialogs
  const [showSubActivationWarning, setShowSubActivationWarning] = useState(false);
  const [showSubDeactivationWarning, setShowSubDeactivationWarning] = useState(false);

  // Service Form State
  const [formData, setFormData] = useState<Omit<Service, "id">>({
    name: "",
    value: "",
    duration: "",
    type: "agendavel",
    isAgendavel: false,
    tipoPreco: "por_contrato" as TipoPreco,
    contratoTemplateId: null,
    possuiSubservicos: false,
    showInCommercial: true,
    showToClient: true,
    documents: [],
    subservices: [],
  });
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("horas");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [servicesData, templatesRes] = await Promise.all([
        catalogService.getCatalogServices(),
        fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/adm/contratos`, {
          headers: { Authorization: `Bearer ${token || ''}` }
        }).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      setServices(servicesData);
      setContratoTemplates(templatesRes);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Nao foi possivel carregar o catalogo.");
    } finally {
      setLoading(false);
    }
  };

  // ======= SERVICE HANDLERS =======

  const handleOpenAddService = () => {
    setEditingService(null);
    setFormData({
      name: "",
      value: "",
      duration: "",
      type: "agendavel",
      isAgendavel: false,
      tipoPreco: "por_contrato",
      contratoTemplateId: null,
      possuiSubservicos: false,
      showInCommercial: true,
      showToClient: true,
      documents: [],
      subservices: [],
    });
    setDurationValue("");
    setDurationUnit("horas");
    setIsServiceDialogOpen(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      value: service.value,
      duration: service.duration,
      type: service.type || "agendavel",
      isAgendavel: service.isAgendavel ?? false,
      tipoPreco: service.tipoPreco ?? "por_contrato",
      contratoTemplateId: service.contratoTemplateId ?? null,
      possuiSubservicos: service.possuiSubservicos ?? false,
      showInCommercial: service.showInCommercial,
      showToClient: service.showToClient,
      documents: service.documents,
      subservices: service.subservices || [],
    });
    const durationParts = service.duration?.split(" ") || [];
    if (durationParts.length >= 2) {
      setDurationValue(durationParts[0]);
      setDurationUnit(durationParts[1]);
    } else {
      setDurationValue(service.duration || "");
      setDurationUnit("horas");
    }
    setIsServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!formData.name) {
      toast.error("Nome e obrigatorio.");
      return;
    }
    if (formData.tipoPreco === 'fixo' && !formData.value) {
      toast.error("Valor e obrigatorio para servicos com preco fixo.");
      return;
    }

    const finalDuration = durationValue ? `${durationValue} ${durationUnit}` : "";

    const submissionData = {
      ...formData,
      duration: finalDuration,
    };

    try {
      setIsSaving(true);
      if (editingService) {
        await catalogService.updateCatalogService(editingService.id, submissionData);
        toast.success("Servico atualizado com sucesso!");
      } else {
        await catalogService.createCatalogService(submissionData);
        toast.success("Servico criado com sucesso!");
      }
      setIsServiceDialogOpen(false);
      fetchAll();
    } catch (error) {
      console.error("Erro ao salvar servico:", error);
      toast.error("Ocorreu um erro ao salvar o servico.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este servico?")) return;
    try {
      await catalogService.deleteCatalogService(id);
      toast.success("Servico removido com sucesso!");
      fetchAll();
    } catch (error) {
      console.error("Erro ao excluir servico:", error);
      toast.error("Erro ao excluir servico.");
    }
  };

  const handleTogglePossuiSubservicos = (value: boolean) => {
    if (value) {
      if (editingService && formData.documents.length > 0) {
        setShowSubActivationWarning(true);
        return;
      }
    } else {
      if (editingService && formData.subservices.some(s => s.documents.length > 0)) {
        setShowSubDeactivationWarning(true);
        return;
      }
    }
    setFormData({ ...formData, possuiSubservicos: value });
  };

  const handleAddDocToService = (tipoDocumento: 'titular' | 'dependente') => {
    const newDoc: DocumentRequirement = {
      id: `temp-${Date.now()}`,
      name: "",
      stage: "pre_contrato",
      required: true,
      tipoDocumento,
    };
    setFormData({ ...formData, documents: [...formData.documents, newDoc] });
  };

  const handleUpdateServiceDoc = (index: number, field: keyof DocumentRequirement, value: any) => {
    const updated = [...formData.documents];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, documents: updated });
  };

  const handleRemoveServiceDoc = (index: number) => {
    setFormData({ ...formData, documents: formData.documents.filter((_, i) => i !== index) });
  };

  const handleAddSubservice = () => {
    const newSub: Subservice = { id: `temp-${Date.now()}`, name: "", documents: [] };
    setFormData({ ...formData, subservices: [...formData.subservices, newSub] });
  };

  const handleUpdateSubserviceName = (index: number, name: string) => {
    const updated = [...formData.subservices];
    updated[index] = { ...updated[index], name };
    setFormData({ ...formData, subservices: updated });
  };

  const handleRemoveSubservice = (index: number) => {
    setFormData({ ...formData, subservices: formData.subservices.filter((_, i) => i !== index) });
  };

  const handleAddDocToSubservice = (subIndex: number, tipoDocumento: 'titular' | 'dependente') => {
    const newDoc: DocumentRequirement = {
      id: `temp-${Date.now()}`,
      name: "",
      stage: "pre_contrato",
      required: true,
      tipoDocumento,
    };
    const updatedSubs = [...formData.subservices];
    updatedSubs[subIndex] = {
      ...updatedSubs[subIndex],
      documents: [...updatedSubs[subIndex].documents, newDoc],
    };
    setFormData({ ...formData, subservices: updatedSubs });
  };

  const handleUpdateSubDoc = (subIndex: number, docIndex: number, field: keyof DocumentRequirement, value: any) => {
    const updatedSubs = [...formData.subservices];
    const updatedDocs = [...updatedSubs[subIndex].documents];
    updatedDocs[docIndex] = { ...updatedDocs[docIndex], [field]: value };
    updatedSubs[subIndex] = { ...updatedSubs[subIndex], documents: updatedDocs };
    setFormData({ ...formData, subservices: updatedSubs });
  };

  const handleRemoveSubDoc = (subIndex: number, docIndex: number) => {
    const updatedSubs = [...formData.subservices];
    updatedSubs[subIndex] = {
      ...updatedSubs[subIndex],
      documents: updatedSubs[subIndex].documents.filter((_, i) => i !== docIndex),
    };
    setFormData({ ...formData, subservices: updatedSubs });
  };

  // ======= FILTERING =======

  const filteredServices = (services || []).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Catalogo de Servicos</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Gerencie servicos, subservicos e requisitos documentais.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenAddService} className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-bold transition-all active:scale-95">
            <Plus className="h-5 w-5" />
            Novo Servico
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar servicos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-background border-border rounded-xl focus:ring-primary/20"
        />
      </div>

      {/* ==================== SECAO 1: SERVICOS ==================== */}
      <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-3xl">
        <CardHeader
          className="border-b bg-muted/30 pb-4 cursor-pointer select-none"
          onClick={() => setServicesExpanded(!servicesExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {servicesExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
              <div>
                <CardTitle className="text-2xl font-bold">Servicos</CardTitle>
                <CardDescription>Servicos principais do catalogo ({filteredServices.length})</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        {servicesExpanded && (
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5 pl-8">Servico</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Valor</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Duracao</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Tipo</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Subservicos</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Docs</TableHead>
                  <TableHead className="w-[80px] py-5 pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 opacity-20" />
                      Carregando servicos...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id} className="group border-b hover:bg-muted/20 transition-colors">
                      <TableCell className="py-4 pl-8">
                        <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {service.value ? (
                          <div className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                            <Euro className="h-4 w-4" />
                            {Number(service.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                            Por Contrato
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {service.duration}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg text-xs">
                            {service.type === 'fixo' ? 'Contrato' : service.type === 'diverso' ? 'Diverso' : 'Agendável'}
                          </Badge>
                          {service.contratoTemplateId && (
                            <Badge variant="secondary" className="bg-blue-500/5 text-blue-600 border-blue-500/10 rounded-lg text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Contrato vinculado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10 rounded-lg">
                          <Layers className="h-3 w-3 mr-1" />
                          {(service.subservices || []).length}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg">
                          {service.documents.length} Requisitos
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pr-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border shadow-2xl">
                            <DropdownMenuItem onClick={() => handleOpenEditService(service)} className="flex gap-2 cursor-pointer font-medium p-2.5">
                              <Edit2 className="h-4 w-4 text-blue-500" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteService(service.id)} className="flex gap-2 cursor-pointer font-medium p-2.5 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                        <Search className="h-12 w-12" />
                        <p className="text-lg font-bold">Nenhum servico encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* ==================== SERVICE DIALOG ==================== */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-b">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {editingService ? "Editar Servico" : "Cadastrar Novo Servico"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Preencha os dados abaixo para disponibilizar o servico na plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Servico</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cidadania Italiana Via Judicial"
                  className="h-12 border-border bg-muted/30 rounded-xl px-4 text-base focus:ring-primary/20 shadow-inner"
                />
              </div>

              {/* Toggle: É Agendável? */}
              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">É Agendável?</Label>
                  <p className="text-xs text-muted-foreground">Requer marcação de horário pelo cliente</p>
                </div>
                <Switch
                  checked={formData.isAgendavel}
                  onCheckedChange={(val) => setFormData({ ...formData, isAgendavel: val })}
                />
              </div>

              {/* Tipo de Preço */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Preço</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipoPreco: 'por_contrato', value: '' })}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      formData.tipoPreco === 'por_contrato'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    Por Contrato
                    <p className="text-xs font-normal mt-0.5 opacity-70">Definido no C2</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipoPreco: 'fixo' })}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      formData.tipoPreco === 'fixo'
                        ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-green-500/50'
                    }`}
                  >
                    Preço Fixo (€)
                    <p className="text-xs font-normal mt-0.5 opacity-70">Valor definido aqui</p>
                  </button>
                </div>
              </div>

              {formData.tipoPreco === 'fixo' && (
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Valor (EUR)
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="0,00"
                      className="h-12 border-border bg-muted/30 rounded-xl pl-11 pr-4 text-base focus:ring-primary/20 shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Duracao Estimada</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      placeholder="Qtd"
                      className="h-12 border-border bg-muted/30 rounded-xl pl-11 pr-4 text-base focus:ring-primary/20 shadow-inner"
                    />
                  </div>
                  <Select value={durationUnit} onValueChange={setDurationUnit}>
                    <SelectTrigger className="w-[120px] h-12 border-border bg-muted/30 rounded-xl px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutos">Minutos</SelectItem>
                      <SelectItem value="horas">Horas</SelectItem>
                      <SelectItem value="dias">Dias</SelectItem>
                      <SelectItem value="meses">Meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contrato Vinculado (opcional) */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Contrato Vinculado <span className="text-muted-foreground font-normal">(Opcional)</span>
                </Label>
                <Select
                  value={formData.contratoTemplateId || "none"}
                  onValueChange={(val) => setFormData({ ...formData, contratoTemplateId: val === "none" ? null : val })}
                >
                  <SelectTrigger className="w-full h-12 border-border bg-muted/30 rounded-xl px-4">
                    <SelectValue placeholder="Selecione um template de contrato..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {contratoTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle: Possui Subserviços */}
              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl md:col-span-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Possui Subserviços?</Label>
                  <p className="text-xs text-muted-foreground">
                    Se ativo, os documentos ficam dentro de cada subserviço
                  </p>
                </div>
                <Switch
                  checked={formData.possuiSubservicos}
                  onCheckedChange={handleTogglePossuiSubservicos}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Exibir para Cliente</Label>
                  <p className="text-xs text-muted-foreground">Visivel no painel do cliente</p>
                </div>
                <Switch
                  checked={formData.showToClient}
                  onCheckedChange={(val) => setFormData({ ...formData, showToClient: val })}
                />
              </div>

            </div>

            {/* ─── SEÇÃO DE DOCUMENTOS / SUBSERVIÇOS ─── */}
            <Separator className="bg-border/50" />

            {formData.possuiSubservicos ? (
              /* ── Construtor de Subserviços ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      Subserviços
                    </h3>
                    <p className="text-sm text-muted-foreground">Cada subserviço tem seus próprios documentos.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubservice}
                    className="gap-1 rounded-xl font-bold border-dashed border-2 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Subserviço
                  </Button>
                </div>

                {formData.subservices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border">
                    Nenhum subserviço adicionado. Clique em "+ Subserviço" para criar.
                  </p>
                )}

                {formData.subservices.map((sub, subIdx) => (
                  <div key={sub.id} className="border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-blue-500/5 border-b border-border">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <Input
                        value={sub.name}
                        onChange={(e) => handleUpdateSubserviceName(subIdx, e.target.value)}
                        placeholder="Nome do subserviço..."
                        className="h-9 flex-1 border-border bg-background rounded-lg text-sm font-medium"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubservice(subIdx)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDocToSubservice(subIdx, 'titular')}
                          className="gap-1 rounded-lg text-xs font-bold border-dashed"
                        >
                          <Plus className="h-3 w-3" />
                          Doc Titular
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDocToSubservice(subIdx, 'dependente')}
                          className="gap-1 rounded-lg text-xs font-bold border-dashed border-orange-400 text-orange-600 hover:bg-orange-500/10"
                        >
                          <Plus className="h-3 w-3" />
                          Doc Dependente
                        </Button>
                      </div>

                      {sub.documents.map((doc, docIdx) => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-bold flex-shrink-0 ${
                              doc.tipoDocumento === 'dependente'
                                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            {doc.tipoDocumento === 'dependente' ? 'Dep.' : 'Tit.'}
                          </Badge>
                          <Input
                            value={doc.name}
                            onChange={(e) => handleUpdateSubDoc(subIdx, docIdx, 'name', e.target.value)}
                            placeholder="Nome do documento..."
                            className="h-8 flex-1 text-xs border-transparent bg-transparent hover:border-border focus:border-border rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSubDoc(subIdx, docIdx)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}

                      {sub.documents.length === 0 && (
                        <p className="text-xs text-muted-foreground opacity-60">Nenhum documento. Adicione docs Titular ou Dependente.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Documentos diretos no serviço ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Documentos do Serviço
                    </h3>
                    <p className="text-sm text-muted-foreground">Documentos exigidos para este serviço.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDocToService('titular')}
                      className="gap-1 rounded-xl font-bold border-dashed border-2"
                    >
                      <Plus className="h-3 w-3" />
                      Doc Titular
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDocToService('dependente')}
                      className="gap-1 rounded-xl font-bold border-dashed border-2 border-orange-400 text-orange-600 hover:bg-orange-500/10"
                    >
                      <Plus className="h-3 w-3" />
                      Doc Dependente
                    </Button>
                  </div>
                </div>

                {formData.documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border">
                    Nenhum documento. Adicione docs Titular ou Dependente.
                  </p>
                )}

                {formData.documents.map((doc, docIdx) => (
                  <div key={doc.id} className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-xl">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-bold flex-shrink-0 ${
                        doc.tipoDocumento === 'dependente'
                          ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {doc.tipoDocumento === 'dependente' ? 'Dependente' : 'Titular'}
                    </Badge>
                    <Input
                      value={doc.name}
                      onChange={(e) => handleUpdateServiceDoc(docIdx, 'name', e.target.value)}
                      placeholder="Nome do documento..."
                      className="h-9 flex-1 text-sm border-transparent bg-transparent hover:border-border focus:border-border rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveServiceDoc(docIdx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

          </div>

          <DialogFooter className="p-8 bg-muted/30 border-t rounded-b-3xl">
            <div className="flex gap-3 w-full justify-end">
              <Button variant="ghost" onClick={() => setIsServiceDialogOpen(false)} disabled={isSaving} className="rounded-xl px-6 font-bold text-muted-foreground">
                Cancelar
              </Button>
              <Button onClick={handleSaveService} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-10 font-bold shadow-xl shadow-primary/20 h-12 transition-all active:scale-95">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingService ? "Atualizar Servico" : "Confirmar Cadastro"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: AVISO ATIVAÇÃO SUBSERVIÇOS ==================== */}
      <Dialog open={showSubActivationWarning} onOpenChange={setShowSubActivationWarning}>
        <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="p-8 bg-gradient-to-br from-yellow-500/10 to-transparent border-b">
            <DialogTitle className="text-2xl font-black tracking-tight">⚠️ Atenção</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Este serviço já possui <strong>{formData.documents.length}</strong> documento(s) vinculados diretamente.
              Ao ativar subserviços, esses documentos não aparecerão mais no fluxo de upload do cliente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 bg-muted/30 border-t rounded-b-3xl">
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                onClick={() => setShowSubActivationWarning(false)}
                className="flex-1 rounded-xl font-bold"
              >
                ← Cancelar
              </Button>
              <Button
                onClick={() => {
                  setFormData({ ...formData, possuiSubservicos: true });
                  setShowSubActivationWarning(false);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold"
              >
                Continuar e criar subserviços
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: AVISO DESATIVAÇÃO SUBSERVIÇOS ==================== */}
      <Dialog open={showSubDeactivationWarning} onOpenChange={setShowSubDeactivationWarning}>
        <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="p-8 bg-gradient-to-br from-yellow-500/10 to-transparent border-b">
            <DialogTitle className="text-2xl font-black tracking-tight">⚠️ Atenção</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Os subserviços deste serviço possuem documentos vinculados.
              Ao desativar subserviços, esses documentos ficarão inacessíveis pelo fluxo de upload.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 bg-muted/30 border-t rounded-b-3xl">
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                onClick={() => setShowSubDeactivationWarning(false)}
                className="flex-1 rounded-xl font-bold"
              >
                ← Cancelar
              </Button>
              <Button
                onClick={() => {
                  setFormData({ ...formData, possuiSubservicos: false });
                  setShowSubDeactivationWarning(false);
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold"
              >
                Desativar e assumir responsabilidade
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
