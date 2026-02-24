import { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Plus, MoreVertical, Trash2, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useAuth } from "../../../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

type UserRole = "comercial" | "juridico" | "administrativo" | "tradutor" | "super_admin";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  nivel?: string | null;
  is_supervisor?: boolean;
  senha?: string | null;
  created_at?: string;
  updated_at?: string;
}

const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "success" | "warning" | "destructive" => {
  const variants: Record<UserRole, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    comercial: "default",
    juridico: "warning",
    administrativo: "success",
    tradutor: "secondary",
    super_admin: "destructive",
  };
  return variants[role] || "default";
};

const getRoleLabel = (role: UserRole, nivel?: string | null): string => {
  const labels: Record<UserRole, string> = {
    comercial: nivel ? `Comercial (${nivel})` : "Comercial",
    juridico: "Jurídico",
    administrativo: "Administrativo",
    tradutor: "Tradutor",
    super_admin: "Super Admin",
  };
  return labels[role] || role;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

export default function UserManagement() {
  const { token } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Detail modal state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formNivel, setFormNivel] = useState<string | null>(null);
  const [formIsSupervisor, setFormIsSupervisor] = useState(false);

  const { toast } = useToast();

  // Carregar membros da equipe
  const fetchTeam = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/team`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Team data:", data);
        setMembers(data);
      }
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("");
    setFormNivel(null);
    setFormIsSupervisor(false);
    setError("");
  };

  const handleRoleChange = (value: string) => {
    // Handle C1/C2 as comercial with nivel
    if (value === "C1" || value === "C2") {
      setFormRole("comercial");
      setFormNivel(value);
    } else {
      setFormRole(value);
      setFormNivel(null);
    }

    // Reset supervisor if tradutor
    if (value === "tradutor") {
      setFormIsSupervisor(false);
    }
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword || !formRole) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          nivel: formNivel,
          is_supervisor: formIsSupervisor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar colaborador");
      } else {
        setOpen(false);
        resetForm();
        fetchTeam(); // Recarregar lista
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name}?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/auth/team/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        fetchTeam();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao remover colaborador");
      }
    } catch {
      alert("Erro de conexão");
    }
  };

  const showSupervisorCheckbox = formRole !== "tradutor" && formRole !== "";

  const openDetail = (member: TeamMember) => {
    setSelectedMember(member);
    setShowPassword(false);
    setIsEditingPassword(false);
    setEditPassword(member.senha || "");
    setDetailOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedMember) return;
    if (!editPassword || editPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres"
      });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/team/${selectedMember.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: editPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.isSelfUpdate) {
          toast({
            title: "Sessão expirada",
            description: "Sua própria senha foi alterada. Você precisará fazer login novamente com a nova senha."
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
          return;
        }

        setIsEditingPassword(false);
        const updatedMember = { ...selectedMember, senha: editPassword };
        setSelectedMember(updatedMember);
        // Atualiza a lista local para evitar race condition com view cache do Supabase
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));

        toast({
          title: "Sucesso",
          description: "Senha atualizada com sucesso!"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error || "Erro ao atualizar senha"
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro de conexão com o servidor"
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Equipe</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Registrar Colaborador</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Adicione um novo membro à equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao.silva@empresa.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">Função</Label>
                <Select onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="C1">C1 (Comercial)</SelectItem>
                    <SelectItem value="C2">C2 (Comercial)</SelectItem>
                    <SelectItem value="juridico">Jurídico</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="tradutor">Tradutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showSupervisorCheckbox && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supervisor"
                    checked={formIsSupervisor}
                    onCheckedChange={(checked) => setFormIsSupervisor(checked as boolean)}
                  />
                  <Label htmlFor="supervisor" className="text-foreground">Usuário é supervisor?</Label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-border text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {creating ? "Criando..." : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Detalhes do Colaborador */}
      <Dialog open={detailOpen} onOpenChange={(isOpen) => { setDetailOpen(isOpen); if (!isOpen) { setSelectedMember(null); setIsEditingPassword(false); } }}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              {selectedMember && (
                <>
                  <Avatar className="h-10 w-10 bg-primary/20">
                    <AvatarFallback className="text-primary text-sm font-medium">
                      {getInitials(selectedMember.full_name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedMember.full_name}</span>
                    {selectedMember.is_supervisor && (
                      <span className="ml-2 text-xs text-amber-500 font-medium">★ Supervisor</span>
                    )}
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações do colaborador
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-2">
              {/* Setor / Função */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Função</span>
                <Badge variant={getRoleBadgeVariant(selectedMember.role)}>
                  {getRoleLabel(selectedMember.role, selectedMember.nivel)}
                </Badge>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground font-medium">{selectedMember.email}</span>
              </div>

              {/* Senha */}
              <div className="py-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Senha</span>
                  {!isEditingPassword && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => { setIsEditingPassword(true); setEditPassword(selectedMember.senha || ""); }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Alterar
                    </Button>
                  )}
                </div>
                {isEditingPassword ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="bg-input border-border text-foreground pr-10"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleUpdatePassword}
                        disabled={savingPassword}
                      >
                        {savingPassword ? "Salvando..." : "Salvar Senha"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground"
                        onClick={() => setIsEditingPassword(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground font-mono">
                      {showPassword
                        ? (selectedMember.senha || "Não definida")
                        : (selectedMember.senha ? "••••••••" : "Não definida")}
                    </span>
                    {selectedMember.senha && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Registrado em */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Registrado em</span>
                <span className="text-sm text-foreground">{timeAgo(selectedMember.created_at)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum colaborador cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Usuário</TableHead>
                  <TableHead className="text-muted-foreground">Função</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Registrado em</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => openDetail(member)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-primary/20">
                          <AvatarFallback className="text-primary text-sm font-medium">
                            {getInitials(member.full_name || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">{member.full_name}</span>
                          {member.is_supervisor && (
                            <span className="ml-2 text-xs text-amber-500 font-medium">★ Supervisor</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role, member.nivel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(member.created_at)}</TableCell>
                    <TableCell>
                      {member.role !== "super_admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(member.id, member.full_name); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
