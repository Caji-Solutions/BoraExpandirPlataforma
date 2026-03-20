import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
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
  Link2,
  Unlink
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { catalogService, Service, Subservice } from "../../services/catalogService";
import { toast } from "sonner";

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [allSubservices, setAllSubservices] = useState<Subservice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Section collapse
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [subservicesExpanded, setSubservicesExpanded] = useState(true);

  // Service Dialog
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Subservice Dialog
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState<Subservice | null>(null);
  const [isSavingSub, setIsSavingSub] = useState(false);

  // Service Form State
  const [formData, setFormData] = useState<Omit<Service, "id">>({
    name: "",
    value: "",
    duration: "",
    type: "agendavel",
    showInCommercial: true,
    showToClient: true,
    requiresLegalDelegation: false,
    documents: [],
    subservices: [],
  });
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("horas");

  // Subservice Form State
  const [subFormData, setSubFormData] = useState<{ name: string; servicoId: string; documents: any[] }>({
    name: "",
    servicoId: "",
    documents: [],
  });

  // Linked subservices for service form (fixo type)
  const [linkedSubIds, setLinkedSubIds] = useState<Set<string>>(new Set());
  const [subSearchTerm, setSubSearchTerm] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [servicesData, subsData] = await Promise.all([
        catalogService.getCatalogServices(),
        catalogService.getSubservices().catch(() => [])
      ]);
      setServices(servicesData);
      setAllSubservices(subsData);
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
      showInCommercial: true,
      showToClient: true,
      requiresLegalDelegation: false,
      documents: [],
      subservices: [],
    });
    setDurationValue("");
    setDurationUnit("horas");
    setLinkedSubIds(new Set());
    setSubSearchTerm("");
    setIsServiceDialogOpen(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      value: service.value,
      duration: service.duration,
      type: service.type || "agendavel",
      showInCommercial: service.showInCommercial,
      showToClient: service.showToClient,
      requiresLegalDelegation: service.requiresLegalDelegation,
      documents: service.documents,
      subservices: service.subservices || [],
    });
    const durationParts = service.duration.split(" ");
    if (durationParts.length >= 2) {
      setDurationValue(durationParts[0]);
      setDurationUnit(durationParts[1]);
    } else {
      setDurationValue(service.duration);
      setDurationUnit("horas");
    }
    setLinkedSubIds(new Set((service.subservices || []).map(s => s.id)));
    setSubSearchTerm("");
    setIsServiceDialogOpen(true);
  };



  const handleSaveService = async () => {
    if (!formData.name || !formData.value) {
      toast.error("Nome e valor sao obrigatorios.");
      return;
    }

    const finalDuration = durationValue ? `${durationValue} ${durationUnit}` : "";
    
    // Build subservices from linked IDs
    const linkedSubs = allSubservices
      .filter(s => linkedSubIds.has(s.id))
      .map(s => ({ id: s.id, name: s.name, documents: s.documents || [] }));

    const submissionData = {
      ...formData,
      duration: finalDuration,
      showInCommercial: true,
      subservices: formData.type === 'fixo' ? linkedSubs : [],
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

  // ======= SUBSERVICE HANDLERS =======

  const handleOpenAddSubservice = () => {
    setEditingSubservice(null);
    setSubFormData({ name: "", servicoId: "", documents: [] });
    setIsSubDialogOpen(true);
  };

  const handleOpenEditSubservice = (sub: Subservice) => {
    setEditingSubservice(sub);
    setSubFormData({
      name: sub.name,
      servicoId: sub.servicoId || "",
      documents: sub.documents || [],
    });
    setIsSubDialogOpen(true);
  };



  const handleSaveSubservice = async () => {
    if (!subFormData.name) {
      toast.error("Nome do subservico e obrigatorio.");
      return;
    }

    try {
      setIsSavingSub(true);
      if (editingSubservice) {
        await catalogService.updateSubservice(editingSubservice.id, subFormData);
        toast.success("Subservico atualizado!");
      } else {
        await catalogService.createSubservice(subFormData);
        toast.success("Subservico criado!");
      }
      setIsSubDialogOpen(false);
      fetchAll();
    } catch (error) {
      console.error("Erro ao salvar subservico:", error);
      toast.error("Erro ao salvar subservico.");
    } finally {
      setIsSavingSub(false);
    }
  };

  const handleDeleteSubservice = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este subservico?")) return;
    try {
      await catalogService.deleteSubservice(id);
      toast.success("Subservico removido!");
      fetchAll();
    } catch (error) {
      console.error("Erro ao excluir subservico:", error);
      toast.error("Erro ao excluir subservico.");
    }
  };

  // ======= FILTERING =======

  const filteredServices = (services || []).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubservices = (allSubservices || []).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Available subs for linking (not already linked to this service, filtered by search)
  const availableSubsForLinking = (allSubservices || []).filter(s =>
    s.name.toLowerCase().includes(subSearchTerm.toLowerCase())
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
          <Button onClick={handleOpenAddSubservice} variant="outline" className="h-12 px-5 rounded-2xl font-bold flex gap-2 border-2 border-dashed hover:border-blue-500 hover:text-blue-600 transition-all">
            <Plus className="h-5 w-5" />
            Novo Subservico
          </Button>
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
          placeholder="Buscar servicos e subservicos..."
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
                        <div className="flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                          <Euro className="h-4 w-4" />
                          {Number(service.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {service.duration}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg">
                          {service.type === 'fixo' ? 'Fixo' : service.type === 'diverso' ? 'Diverso' : 'Agendavel'}
                        </Badge>
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

      {/* ==================== SECAO 2: SUBSERVICOS ==================== */}
      <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-3xl">
        <CardHeader
          className="border-b bg-muted/30 pb-4 cursor-pointer select-none"
          onClick={() => setSubservicesExpanded(!subservicesExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {subservicesExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Layers className="h-6 w-6 text-blue-500" />
                  Subservicos
                </CardTitle>
                <CardDescription>Tipos e variacoes de servicos ({filteredSubservices.length})</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        {subservicesExpanded && (
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5 pl-8">Subservico</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Servico Pai</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Documentos</TableHead>
                  <TableHead className="w-[80px] py-5 pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 opacity-20" />
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredSubservices.length > 0 ? (
                  filteredSubservices.map((sub) => (
                    <TableRow key={sub.id} className="group border-b hover:bg-muted/20 transition-colors">
                      <TableCell className="py-4 pl-8">
                        <div className="font-bold text-base text-foreground group-hover:text-blue-600 transition-colors">
                          {sub.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {sub.servicoNome ? (
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg">
                            <Link2 className="h-3 w-3 mr-1" />
                            {sub.servicoNome}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sem vinculo</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="rounded-lg">
                          <FileText className="h-3 w-3 mr-1" />
                          {(sub.documents || []).length} Docs
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
                            <DropdownMenuItem onClick={() => handleOpenEditSubservice(sub)} className="flex gap-2 cursor-pointer font-medium p-2.5">
                              <Edit2 className="h-4 w-4 text-blue-500" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSubservice(sub.id)} className="flex gap-2 cursor-pointer font-medium p-2.5 text-destructive hover:bg-destructive/10">
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
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                        <Layers className="h-10 w-10" />
                        <p className="font-bold">Nenhum subservico encontrado</p>
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

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Unitario (EUR)</Label>
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

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo do Servico</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val as any })}
                >
                  <SelectTrigger className="w-full h-12 border-border bg-muted/30 rounded-xl px-4">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendavel">Agendavel</SelectItem>
                    <SelectItem value="fixo">Fixo</SelectItem>
                    <SelectItem value="diverso">Diverso</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Requer Delegacao Juridica</Label>
                  <p className="text-xs text-muted-foreground">Exige atribuicao de responsavel</p>
                </div>
                <Switch
                  checked={formData.requiresLegalDelegation}
                  onCheckedChange={(val) => setFormData({ ...formData, requiresLegalDelegation: val })}
                />
              </div>
            </div>

            {/* Linked subservices (fixo type only) */}
            {formData.type === 'fixo' && (
              <>
                <Separator className="bg-border/50" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      Subservicos Vinculados
                    </h3>
                    <p className="text-sm text-muted-foreground">Selecione os subservicos que pertencem a este servico.</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar subservicos para vincular..."
                      value={subSearchTerm}
                      onChange={(e) => setSubSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-border bg-background rounded-xl"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-2">
                    {availableSubsForLinking.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum subservico encontrado. Crie um primeiro.</p>
                    ) : (
                      availableSubsForLinking.map(sub => (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                            linkedSubIds.has(sub.id)
                              ? 'bg-blue-500/10 border border-blue-500/20'
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={linkedSubIds.has(sub.id)}
                            onChange={() => {
                              const newSet = new Set(linkedSubIds);
                              if (newSet.has(sub.id)) {
                                newSet.delete(sub.id);
                              } else {
                                newSet.add(sub.id);
                              }
                              setLinkedSubIds(newSet);
                            }}
                            className="rounded border-border text-blue-500 focus:ring-blue-500/20"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-sm">{sub.name}</span>
                            {sub.documents && sub.documents.length > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">({sub.documents.length} docs)</span>
                            )}
                          </div>
                          {linkedSubIds.has(sub.id) ? (
                            <Link2 className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Unlink className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </label>
                      ))
                    )}
                  </div>

                  {linkedSubIds.size > 0 && (
                    <p className="text-xs text-muted-foreground">{linkedSubIds.size} subservico(s) vinculado(s)</p>
                  )}
                </div>
              </>
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

      {/* ==================== SUBSERVICE DIALOG ==================== */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="p-8 bg-gradient-to-br from-blue-500/10 to-transparent border-b">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Layers className="h-7 w-7 text-blue-500" />
              {editingSubservice ? "Editar Subservico" : "Cadastrar Subservico"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Defina o subservico e seus requisitos documentais.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Subservico</Label>
                <Input
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  placeholder="Ex: Cidadania Italiana via Judicial"
                  className="h-12 border-border bg-muted/30 rounded-xl px-4 text-base focus:ring-primary/20 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Servico Pai (Opcional)</Label>
                <Select value={subFormData.servicoId || "none"} onValueChange={(val) => setSubFormData({ ...subFormData, servicoId: val === "none" ? "" : val })}>
                  <SelectTrigger className="w-full h-12 border-border bg-muted/30 rounded-xl px-4">
                    <SelectValue placeholder="Selecione um servico pai..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem vinculo</SelectItem>
                    {services.filter(s => s.type === 'fixo').map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <DialogFooter className="p-8 bg-muted/30 border-t rounded-b-3xl">
            <div className="flex gap-3 w-full justify-end">
              <Button variant="ghost" onClick={() => setIsSubDialogOpen(false)} disabled={isSavingSub} className="rounded-xl px-6 font-bold text-muted-foreground">
                Cancelar
              </Button>
              <Button onClick={handleSaveSubservice} disabled={isSavingSub} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-bold shadow-xl shadow-blue-600/20 h-12 transition-all active:scale-95">
                {isSavingSub && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSubservice ? "Atualizar Subservico" : "Criar Subservico"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
