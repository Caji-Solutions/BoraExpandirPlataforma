import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/modules/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/shared/components/ui/dialog';
import { Input } from '@/modules/shared/components/ui/input';
import { Label } from "@/modules/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { Plus, MoreVertical, Trash2, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { Switch } from "@/modules/shared/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/modules/shared/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { useAuth } from "../../../../contexts/AuthContext";
import { maskCpfInput, maskPhoneInput } from "@/utils/formatters";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

type UserRole = "comercial" | "juridico" | "administrativo" | "tradutor" | "super_admin";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  nivel?: string | null;
  cargo?: string | null;
  is_supervisor?: boolean;
  supervisor_id?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  horario_trabalho?: string | null;
  created_at?: string;
  updated_at?: string;
  registration_complete?: boolean;
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
  const [error, setError] = useState("");

  // Detail modal state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Draft pendente (cadastro incompleto — sem supervisor atribuído)
  const [draftData, setDraftData] = useState<TeamMember | null>(null);
  const [pendingDraftId, setPendingDraftId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Link orphans confirmation state (triggered after creating a new supervisor with orphans in area)
  const [linkOrphansOpen, setLinkOrphansOpen] = useState(false);
  const [newSupervisorIdForOrphans, setNewSupervisorIdForOrphans] = useState<string | null>(null);
  const [orphansToLink, setOrphansToLink] = useState<TeamMember[]>([]);

  // Orphan reassignment state (when deleting a supervisor with subordinates)
  const [orphanReassignOpen, setOrphanReassignOpen] = useState(false);
  const [orphanCollaborators, setOrphanCollaborators] = useState<TeamMember[]>([]);
  const [deletingSupervisor, setDeletingSupervisor] = useState<{ id: string; name: string; role: string; nivel?: string | null } | null>(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState<string | null>(null);
  const [savingReassignment, setSavingReassignment] = useState(false);
  const [orphanIdsForNewSupervisor, setOrphanIdsForNewSupervisor] = useState<string[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formNivel, setFormNivel] = useState<string | null>(null);
  const [formIsSupervisor, setFormIsSupervisor] = useState(false);
  const [formSupervisorId, setFormSupervisorId] = useState<string | null>(null);
  const [formCpf, setFormCpf] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formHorarioEntrada, setFormHorarioEntrada] = useState("");
  const [formHorarioSaida, setFormHorarioSaida] = useState("");

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
        // Filtrar clientes — eles devem aparecer apenas no DNA do Cliente
        const teamOnly = data.filter((m: any) => m.role !== 'cliente');
        setMembers(teamOnly);
      }
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkForPendingDraft = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/team/draft`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const draft = await res.json();
        if (draft) {
          setDraftData(draft);
          setPendingDraftId(draft.id);
          toast({
            title: "Cadastro incompleto",
            description: "Existe um colaborador aguardando atribuição de supervisor.",
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchTeam();
    checkForPendingDraft();
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
      setIsEditing(false);
      setEditId(null);
    } else if (!isEditing && draftData) {
      setFormName(draftData.full_name || "");
      setFormEmail(draftData.email || "");
      setFormRole(draftData.role || "");
      setFormNivel(draftData.nivel || null);
      setFormIsSupervisor(draftData.is_supervisor || false);
      setFormCpf(draftData.cpf || "");
      setFormTelefone(draftData.telefone || "");
      if (draftData.horario_trabalho && draftData.horario_trabalho.includes(" - ")) {
        const [entrada, saida] = draftData.horario_trabalho.split(" - ");
        setFormHorarioEntrada(entrada.trim());
        setFormHorarioSaida(saida.trim());
      }
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("");
    setFormNivel(null);
    setFormIsSupervisor(false);
    setFormSupervisorId(null);
    setFormCpf("");
    setFormTelefone("");
    setFormHorarioEntrada("");
    setFormHorarioSaida("");
    setError("");
  };

  const openEditModal = (member: TeamMember) => {
    setIsEditing(true);
    setEditId(member.id);
    setFormName(member.full_name || "");
    setFormEmail(member.email || "");
    setFormPassword(""); // Don't pre-fill password for security
    setFormRole(member.role || "");
    setFormNivel(member.nivel || null);
    setFormIsSupervisor(member.is_supervisor || false);
    setFormSupervisorId(member.supervisor_id || null);
    setFormCpf(member.cpf || "");
    setFormTelefone(member.telefone || "");
    
    if (member.horario_trabalho && member.horario_trabalho.includes(" - ")) {
      const [entrada, saida] = member.horario_trabalho.split(" - ");
      setFormHorarioEntrada(entrada.trim());
      setFormHorarioSaida(saida.trim());
    } else {
      setFormHorarioEntrada("");
      setFormHorarioSaida("");
    }
    
    setError("");
    setDetailOpen(false); // Close detail modal if open
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || (!isEditing && !formPassword) || !formRole) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (formRole === 'comercial' && !formNivel) {
      setError("Selecione o nível (C1 ou C2)");
      return;
    }

    const needsSupervisor = !formIsSupervisor && formRole !== 'tradutor' && !(formRole === 'comercial' && !formNivel);
    if (needsSupervisor && availableInlineSupervisors.length > 0 && !formSupervisorId) {
      setError("Selecione um supervisor responsável");
      return;
    }

    setSaving(true);
    setError("");
    const horarioCombinado = formHorarioEntrada && formHorarioSaida
      ? `${formHorarioEntrada} - ${formHorarioSaida}`
      : formHorarioEntrada || formHorarioSaida || "";

    const asDraft = !isEditing && !pendingDraftId && needsSupervisor && availableInlineSupervisors.length === 0;
    const completingDraft = !isEditing && !!pendingDraftId && !asDraft;
    const newSupervisorRole = formRole;
    const newIsSupervisor = formIsSupervisor;

    try {
      let url: string;
      let method: string;
      if (isEditing) {
        url = `${BACKEND_URL}/auth/team/${editId}`;
        method = "PATCH";
      } else if (completingDraft) {
        url = `${BACKEND_URL}/auth/team/${pendingDraftId}`;
        method = "PATCH";
      } else if (asDraft) {
        url = `${BACKEND_URL}/auth/team/draft`;
        method = "POST";
      } else {
        url = `${BACKEND_URL}/auth/register`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          ...(!isEditing && !completingDraft ? { password: formPassword } : {}),
          role: formRole,
          nivel: formNivel,
          is_supervisor: formIsSupervisor,
          supervisor_id: formSupervisorId,
          cpf: formCpf,
          telefone: formTelefone,
          horario_trabalho: horarioCombinado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Erro ao ${isEditing || completingDraft ? 'atualizar' : 'criar'} colaborador`);
        setSaving(false);
        return;
      }

      if (completingDraft && pendingDraftId) {
        try {
          await fetch(`${BACKEND_URL}/auth/team/${pendingDraftId}/complete`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        } catch {}
        setDraftData(null);
        setPendingDraftId(null);
      }

      const savedUserId = isEditing ? editId! : completingDraft ? pendingDraftId : data.user?.id;
      const wasEditing = isEditing;

      setOpen(false);
      setIsEditing(false);
      setEditId(null);
      resetForm();

      if (orphanIdsForNewSupervisor.length > 0 && savedUserId) {
        try {
          await fetch(`${BACKEND_URL}/auth/team/${savedUserId}/delegados`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ delegateIds: orphanIdsForNewSupervisor })
          });
          if (deletingSupervisor) {
            await fetch(`${BACKEND_URL}/auth/team/${deletingSupervisor.id}`, {
              method: "DELETE",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
          }
        } catch {}
        setOrphanIdsForNewSupervisor([]);
        setDeletingSupervisor(null);
        setOrphanCollaborators([]);
        fetchTeam();
        toast({
          title: 'Sucesso',
          description: 'Novo supervisor criado e colaboradores reatribuídos.',
        });
        setSaving(false);
        return;
      }

      fetchTeam();
      toast({
        title: "Sucesso",
        description: `Colaborador ${wasEditing ? 'atualizado' : 'criado'} com sucesso!`,
      });

      if (!wasEditing && newIsSupervisor && savedUserId) {
        const orphans = members.filter(
          (m) => !m.is_supervisor && m.role === newSupervisorRole && !m.supervisor_id
        );
        if (orphans.length > 0) {
          setNewSupervisorIdForOrphans(savedUserId);
          setOrphansToLink(orphans);
          setLinkOrphansOpen(true);
        }
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLinkOrphans = async (shouldLink: boolean) => {
    if (shouldLink && newSupervisorIdForOrphans) {
      try {
        await fetch(`${BACKEND_URL}/auth/team/${newSupervisorIdForOrphans}/delegados`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ delegateIds: orphansToLink.map((o) => o.id) }),
        });
        toast({
          title: 'Sucesso',
          description: `${orphansToLink.length} colaborador(es) vinculado(s) ao novo supervisor.`,
        });
        fetchTeam();
      } catch {
        toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao vincular colaboradores.' });
      }
    }
    setLinkOrphansOpen(false);
    setNewSupervisorIdForOrphans(null);
    setOrphansToLink([]);
  };

  const handleDelete = async (id: string, name: string) => {
    const member = members.find(m => m.id === id);

    // If supervisor, check for orphaned subordinates first
    if (member?.is_supervisor) {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/team/delegados/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const delegados: TeamMember[] = await res.json();
          if (delegados.length > 0) {
            setDeletingSupervisor({ id, name, role: member.role, nivel: member.nivel });
            setOrphanCollaborators(delegados);
            setSelectedReplacementId(null);
            setOrphanReassignOpen(true);
            return;
          }
        }
      } catch {}
    }

    // Not a supervisor or no subordinates — delete directly
    try {
      const res = await fetch(`${BACKEND_URL}/auth/team/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        fetchTeam();
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: data.error || "Erro ao remover colaborador",
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: "Erro de conexão",
      });
    }
  };

  const handleReassignAndDelete = async () => {
    if (!deletingSupervisor || !selectedReplacementId) return;
    setSavingReassignment(true);
    try {
      for (const orphan of orphanCollaborators) {
        await fetch(`${BACKEND_URL}/auth/team/${orphan.id}/supervisor`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ supervisor_id: selectedReplacementId })
        });
      }
      const delRes = await fetch(`${BACKEND_URL}/auth/team/${deletingSupervisor.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!delRes.ok) {
        const data = await delRes.json();
        toast({ variant: 'destructive', title: 'Erro', description: data.error || 'Erro ao remover supervisor' });
        return;
      }
      setOrphanReassignOpen(false);
      setDeletingSupervisor(null);
      setOrphanCollaborators([]);
      setSelectedReplacementId(null);
      fetchTeam();
      toast({ title: 'Sucesso', description: 'Supervisor removido e colaboradores reatribuídos.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao reatribuir colaboradores.' });
    } finally {
      setSavingReassignment(false);
    }
  };

  const handleCreateReplacementSupervisor = () => {
    setOrphanIdsForNewSupervisor(orphanCollaborators.map(o => o.id));
    setOrphanReassignOpen(false);
    resetForm();
    if (deletingSupervisor) {
      setFormRole(deletingSupervisor.role);
      if (deletingSupervisor.role === 'comercial') {
        setFormNivel('C2');
      }
    }
    setFormIsSupervisor(true);
    setOpen(true);
  };

  const availableInlineSupervisors = members.filter(
    m => m.is_supervisor && m.role === formRole && m.id !== editId
  );

  const showSupervisorCheckbox = formRole !== "tradutor" && formRole !== "" && !(formRole === 'comercial' && formNivel === 'C1') && !(formRole === 'comercial' && !formNivel);

  const availableReplacementSupervisors = members.filter(
    m => m.is_supervisor && m.id !== deletingSupervisor?.id && m.role === deletingSupervisor?.role
  );

  const openDetail = (member: TeamMember) => {
    setSelectedMember(member);
    setShowPassword(false);
    setIsEditingPassword(false);
    setEditPassword("");
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
        const updatedMember = { ...selectedMember };
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
              <DialogTitle className="text-foreground">
                {isEditing ? "Editar Colaborador" : "Registrar Colaborador"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEditing ? "Altere os dados do membro da equipe" : "Adicione um novo membro à equipe"}
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
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password" title="Obrigatório para novos usuários" className="text-foreground font-bold">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="bg-input border-border text-foreground border-2 border-primary/20"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formCpf}
                    onChange={(e) => setFormCpf(maskCpfInput(e.target.value))}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-foreground">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(maskPhoneInput(e.target.value))}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setor" className="text-foreground">Setor</Label>
                  <Select
                    value={formRole}
                    onValueChange={(v) => {
                      setFormRole(v);
                      setFormNivel(null);
                      setFormSupervisorId(null);
                      if (v === 'tradutor') setFormIsSupervisor(false);
                    }}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="juridico">Jurídico</SelectItem>
                      <SelectItem value="administrativo">Administrativo / Financeiro</SelectItem>
                      <SelectItem value="tradutor">Tradutor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formRole === 'comercial' && (
                  <div className="space-y-2">
                    <Label htmlFor="nivel" className="text-foreground">Nível</Label>
                    <Select
                      value={formNivel || ''}
                      onValueChange={(v) => {
                        setFormNivel(v);
                        if (v === 'C1') setFormIsSupervisor(false);
                      }}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="C1">C1</SelectItem>
                        <SelectItem value="C2">C2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {showSupervisorCheckbox && (
                <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <Switch
                    id="supervisor"
                    checked={formIsSupervisor}
                    onCheckedChange={(checked) => {
                      setFormIsSupervisor(checked);
                      if (checked) setFormSupervisorId(null);
                    }}
                  />
                  <Label htmlFor="supervisor" className="text-foreground cursor-pointer">
                    É supervisor deste setor?
                  </Label>
                </div>
              )}
              {!formIsSupervisor && formRole && formRole !== 'tradutor' && !(formRole === 'comercial' && !formNivel) && (
                <div className="space-y-2">
                  <Label htmlFor="supervisor-select" className="text-foreground">
                    Supervisor responsável {availableInlineSupervisors.length > 0 && <span className="text-destructive">*</span>}
                  </Label>
                  {availableInlineSupervisors.length === 0 ? (
                    <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      Nenhum supervisor cadastrado neste setor. O cadastro ficará como rascunho — crie um supervisor depois para vincular automaticamente.
                    </div>
                  ) : (
                    <Select
                      value={formSupervisorId || ''}
                      onValueChange={(v) => setFormSupervisorId(v)}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione o supervisor" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableInlineSupervisors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entrada" className="text-foreground">Horário de Entrada</Label>
                  <Input
                    id="entrada"
                    type="time"
                    value={formHorarioEntrada}
                    onChange={(e) => setFormHorarioEntrada(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saida" className="text-foreground">Horário de Saída</Label>
                  <Input
                    id="saida"
                    type="time"
                    value={formHorarioSaida}
                    onChange={(e) => setFormHorarioSaida(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
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
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Salvando..." : (isEditing ? "Salvar e Continuar" : "Criar")}
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
                      {getInitials(selectedMember?.full_name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedMember?.full_name}</span>
                    {selectedMember?.is_supervisor && (
                      <span className="ml-2 text-xs text-amber-500 font-medium">★ Supervisor</span>
                    )}
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex justify-between items-center">
              Informações do colaborador
              {selectedMember && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2"
                  onClick={() => selectedMember && openEditModal(selectedMember)}
                >
                  <Pencil className="h-3 w-3" />
                  Editar Dados
                </Button>
              )}
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
                <span className="text-sm text-foreground font-medium">{selectedMember?.email}</span>
              </div>

              {/* CPF */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">CPF</span>
                <span className="text-sm text-foreground font-medium">{selectedMember?.cpf || "—"}</span>
              </div>

              {/* Telefone */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <span className="text-sm text-foreground font-medium">{selectedMember?.telefone || "—"}</span>
              </div>

              {/* Supervisor */}
              {selectedMember?.supervisor_id && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Supervisor</span>
                  <span className="text-sm text-foreground font-medium">
                    {members.find(m => m.id === selectedMember.supervisor_id)?.full_name || "—"}
                  </span>
                </div>
              )}

              {/* Horário de Trabalho */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Horário de Trabalho</span>
                <span className="text-sm text-foreground font-medium">{selectedMember?.horario_trabalho || "—"}</span>
              </div>

              {/* Senha */}
              <div className="py-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Segurança</span>
                  {!isEditingPassword && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setIsEditingPassword(true)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Redefinir Senha
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
                        {savingPassword ? "Salvando..." : "Salvar Nova Senha"}
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
                    <span className="text-sm text-muted-foreground italic">
                      As senhas são criptografadas e não podem ser visualizadas.
                    </span>
                  </div>
                )}
              </div>

              {/* Registrado em */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Registrado em</span>
                <span className="text-sm text-foreground">{selectedMember?.created_at ? timeAgo(selectedMember.created_at) : "—"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Reatribuição de colaboradores órfãos */}
      <Dialog open={orphanReassignOpen} onOpenChange={(isOpen) => { if (!isOpen) { setOrphanReassignOpen(false); setDeletingSupervisor(null); } }}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reatribuir Colaboradores</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {deletingSupervisor?.name} é supervisor de {orphanCollaborators.length} colaborador{orphanCollaborators.length !== 1 ? 'es' : ''}. Escolha um novo supervisor antes de remover.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Colaboradores que serão reatribuídos
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {orphanCollaborators.map(o => (
                <div key={o.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border rounded-md">
                  <span className="text-sm text-foreground">{o.full_name}</span>
                  {o.nivel && (
                    <span className="text-xs text-muted-foreground">({o.nivel})</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Selecionar novo supervisor
            </span>
            {availableReplacementSupervisors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum outro supervisor encontrado no setor {deletingSupervisor ? getRoleLabel(deletingSupervisor.role as UserRole, deletingSupervisor.nivel) : ''}.
              </p>
            ) : (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {availableReplacementSupervisors.map(sup => (
                  <div
                    key={sup.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      id={`replace-${sup.id}`}
                      checked={selectedReplacementId === sup.id}
                      onCheckedChange={(checked) => setSelectedReplacementId(checked ? sup.id : null)}
                    />
                    <Label htmlFor={`replace-${sup.id}`} className="text-sm text-foreground cursor-pointer flex-1">
                      {sup.full_name}
                      <span className="text-xs text-amber-500 ml-2 font-medium">★ Supervisor</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCreateReplacementSupervisor}
              className="border-border text-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Supervisor
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setOrphanReassignOpen(false); setDeletingSupervisor(null); }}
                className="border-border text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReassignAndDelete}
                disabled={!selectedReplacementId || savingReassignment}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {savingReassignment ? 'Reatribuindo...' : 'Reatribuir e Remover'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={linkOrphansOpen} onOpenChange={(isOpen) => { if (!isOpen) handleConfirmLinkOrphans(false); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Vincular colaboradores?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Existem <strong>{orphansToLink.length}</strong> colaborador{orphansToLink.length !== 1 ? 'es' : ''} neste setor sem supervisor. Deseja vincular todos ao novo supervisor?
              <div className="mt-3 flex flex-wrap gap-1.5">
                {orphansToLink.map((o) => (
                  <span key={o.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border rounded-md text-xs text-foreground">
                    {o.full_name}{o.nivel ? ` (${o.nivel})` : ''}
                  </span>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground" onClick={() => handleConfirmLinkOrphans(false)}>
              Não vincular
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleConfirmLinkOrphans(true)}
            >
              Vincular todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja remover {deleteTarget?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget.id, deleteTarget.name);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => setDeleteTarget({ id: member.id, name: member.full_name || "este colaborador" })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
