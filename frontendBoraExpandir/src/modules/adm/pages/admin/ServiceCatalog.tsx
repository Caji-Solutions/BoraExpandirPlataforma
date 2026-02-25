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
  CalendarCheck,
  Loader2
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
import { catalogService, Service, DocumentRequirement } from "../../services/catalogService";
import { toast } from "sonner";

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Service, "id">>({
    name: "",
    value: "",
    duration: "",
    showInCommercial: true,
    documents: [],
  });

  // Local state for duration parts
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("horas");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getCatalogServices();
      setServices(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      toast.error("Não foi possível carregar o catálogo de serviços.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: "",
      value: "",
      duration: "",
      showInCommercial: true,
      documents: [],
    });
    setDurationValue("");
    setDurationUnit("horas");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      value: service.value,
      duration: service.duration,
      showInCommercial: service.showInCommercial,
      documents: service.documents,
    });

    // Tentar extrair valor e unidade da duração (Ex: "10 horas")
    const durationParts = service.duration.split(" ");
    if (durationParts.length >= 2) {
      setDurationValue(durationParts[0]);
      setDurationUnit(durationParts[1]);
    } else {
      setDurationValue(service.duration);
      setDurationUnit("horas");
    }

    setIsDialogOpen(true);
  };

  const addDocumentToForm = () => {
    const newDoc: DocumentRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      stage: "1",
      required: true,
    };
    setFormData({ ...formData, documents: [...formData.documents, newDoc] });
  };

  const removeDocumentFromForm = (id: string) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((doc) => doc.id !== id),
    });
  };

  const updateDocumentInForm = (id: string, field: keyof DocumentRequirement, value: any) => {
    setFormData({
      ...formData,
      documents: formData.documents.map((doc) =>
        doc.id === id ? { ...doc, [field]: value } : doc
      ),
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.value) {
      toast.error("Nome e valor são obrigatórios.");
      return;
    }

    const finalDuration = durationValue ? `${durationValue} ${durationUnit}` : "";
    const submissionData = { ...formData, duration: finalDuration };

    try {
      setIsSaving(true);
      if (editingService) {
        await catalogService.updateCatalogService(editingService.id, submissionData);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await catalogService.createCatalogService(submissionData);
        toast.success("Serviço criado com sucesso!");
      }
      setIsDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Ocorreu um erro ao salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    try {
      await catalogService.deleteCatalogService(id);
      toast.success("Serviço removido com sucesso!");
      fetchServices();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      toast.error("Erro ao excluir serviço.");
    }
  };

  const filteredServices = (services || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Catálogo de Serviços</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Gerencie o portfólio de serviços, precificação e requisitos documentais.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-bold transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Novo Serviço
        </Button>
      </div>

      <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-3xl">
        <CardHeader className="border-b bg-muted/30 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Serviços Cadastrados</CardTitle>
              <CardDescription>Visualize e edite todos os serviços disponíveis na plataforma.</CardDescription>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background border-border rounded-xl focus:ring-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-bold text-xs uppercase tracking-widest py-5 pl-8">Serviço</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Valor</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Duração Est.</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Agendamento</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Documentos</TableHead>
                <TableHead className="w-[100px] py-5 pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 opacity-20" />
                    Carregando serviços...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="group border-b hover:bg-muted/20 transition-colors">
                    <TableCell className="py-4 pl-8">
                      <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">ID: {service.id}</div>
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
                      {service.showInCommercial ? (
                        <Badge variant="success" className="bg-green-500/10 text-green-600 border-green-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                          <CalendarCheck className="h-3.5 w-3.5" />
                          Visível
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-dashed border-muted-foreground/30 px-2.5 py-1 rounded-lg w-fit">
                          Privado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-lg">
                          {service.documents.length} Requisitos
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border shadow-2xl">
                          <DropdownMenuItem onClick={() => handleOpenEdit(service)} className="flex gap-2 cursor-pointer font-medium p-2.5">
                            <Edit2 className="h-4 w-4 text-blue-500" />
                            Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(service.id)} className="flex gap-2 cursor-pointer font-medium p-2.5 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                            Excluir Serviço
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Search className="h-12 w-12" />
                      <p className="text-lg font-bold">Nenhum serviço encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-b">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Preencha os dados abaixo para disponibilizar o serviço na plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Serviço</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cidadania Italiana Via Judicial"
                  className="h-12 border-border bg-muted/30 rounded-xl px-4 text-base focus:ring-primary/20 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Unitário (€)</Label>
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
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Duração Estimada</Label>
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

              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Exibir para Agendamento</Label>
                  <p className="text-xs text-muted-foreground">Disponibilizar no Comercial</p>
                </div>
                <Switch
                  checked={formData.showInCommercial}
                  onCheckedChange={(val) => setFormData({ ...formData, showInCommercial: val })}
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documentos Necessários
                  </h3>
                  <p className="text-sm text-muted-foreground">Adicione os requisitos documentais para este serviço.</p>
                </div>
                <Button onClick={addDocumentToForm} variant="outline" size="sm" className="rounded-lg border-2 border-dashed font-bold hover:bg-primary/5 hover:text-primary transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Requisito
                </Button>
              </div>

              <div className="space-y-3">
                {formData.documents.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-border rounded-2xl text-center bg-muted/10">
                    <p className="text-sm text-muted-foreground font-medium">Nenhum documento configurado ainda.</p>
                  </div>
                ) : (
                  formData.documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border group animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <GripVertical className="h-5 w-5 text-muted-foreground opacity-30 cursor-move hidden md:block" />
                        <Input
                          placeholder="Nome do documento..."
                          value={doc.name}
                          onChange={(e) => updateDocumentInForm(doc.id, "name", e.target.value)}
                          className="bg-background border-border rounded-xl h-10"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <Select
                          value={doc.stage}
                          onValueChange={(val) => updateDocumentInForm(doc.id, "stage", val)}
                        >
                          <SelectTrigger className="w-[140px] bg-background border-border rounded-xl h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border">
                            <SelectItem value="1">Etapa 1: Base</SelectItem>
                            <SelectItem value="2">Etapa 2: Apostila</SelectItem>
                            <SelectItem value="3">Etapa 3: Tradução</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 px-3 h-10 bg-background border border-border rounded-xl min-w-[120px]">
                          <Switch
                            checked={doc.required}
                            onCheckedChange={(val) => updateDocumentInForm(doc.id, "required", val)}
                            className="scale-75"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Obrigatório</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocumentFromForm(doc.id)}
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-muted/30 border-t rounded-b-3xl">
            <div className="flex gap-3 w-full justify-end">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl px-6 font-bold text-muted-foreground">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-10 font-bold shadow-xl shadow-primary/20 h-12 transition-all active:scale-95">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingService ? "Atualizar Serviço" : "Confirmar Cadastro"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
