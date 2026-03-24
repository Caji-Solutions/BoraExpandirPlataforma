import { Button } from "@/modules/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-foreground">
          Super Admin Portal
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Painel de controle mestre para gestão completa do sistema
        </p>
        <Button
          onClick={() => navigate("/admin")}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Acessar Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
