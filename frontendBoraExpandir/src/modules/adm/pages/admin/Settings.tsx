import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/shared/components/ui/card";
import { Label } from "@/modules/shared/components/ui/label";
import { Input } from "@/modules/shared/components/ui/input";
import { Button } from "@/modules/shared/components/ui/button";
import { Switch } from "@/modules/shared/components/ui/switch";
import { Separator } from "@/modules/shared/components/ui/separator";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações Globais</h1>
        <p className="text-muted-foreground mt-2">
          Configure as preferências do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configurações da Empresa</CardTitle>
            <CardDescription className="text-muted-foreground">
              Informações básicas da organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-foreground">
                Nome da Empresa
              </Label>
              <Input
                id="company-name"
                defaultValue="Immigration Services Ltd."
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email" className="text-foreground">
                Email de Contato
              </Label>
              <Input
                id="company-email"
                type="email"
                defaultValue="contato@company.com"
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone" className="text-foreground">
                Telefone
              </Label>
              <Input
                id="company-phone"
                defaultValue="+351 21 123 4567"
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Preferências do Sistema</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure o comportamento do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar alertas importantes por email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Aprovação de Documentos</Label>
                <p className="text-sm text-muted-foreground">
                  Requer aprovação manual para uploads
                </p>
              </div>
              <Switch />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Auditoria Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Registrar todas as ações do sistema
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ações irreversíveis. Use com cautela.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Limpar Cache do Sistema</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove todos os dados temporários e cache
                </p>
              </div>
              <Button variant="destructive">Limpar Cache</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <h4 className="font-medium text-foreground">Resetar Configurações</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Restaura todas as configurações para valores padrão
                </p>
              </div>
              <Button variant="destructive">Resetar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
