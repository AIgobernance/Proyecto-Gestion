import React from "react";
import imgLogo1 from "../assets/logo-principal.jpg";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Globe, Building2, Award, Flag, ChevronDown, Shield, Users } from "lucide-react";

// Datos de los marcos de referencia
const frameworks = [
  {
    icon: Globe,
    title: "ISO 27090 DIS - 27091",
    description:
      "Se enfocan en marcos de evaluación y aseguramiento de la continuidad de servicios, con énfasis en la resiliencia y la protección de activos de información.",
    badge: "Seguridad",
  },
  {
    icon: Shield,
    title: "ISO 23894",
    description:
      "Norma internacional que proporciona orientación sobre la gestión de riesgos específicos de la inteligencia artificial (IA) para organizaciones.",
    badge: "Riesgos IA",
  },
  {
    icon: Building2,
    title: "NIS2 / AI Act",
    description:
      "NIS2 refuerza la ciberseguridad en sectores críticos, mientras que la IA Act regula los sistemas de inteligencia artificial según su nivel de riesgo.",
    badge: "UE",
  },
  {
    icon: Award,
    title: "ISO 42001 - 42005",
    description:
      "ISO 42001 es la norma certificable para gestionar y usar la IA de forma responsable en una organización.",
    badge: "Certificable",
  },
  {
    icon: Flag,
    title: "CONPES 4144",
    subtitle: "2025",
    description:
      "Política Nacional de Inteligencia Artificial para generar capacidades de investigación, desarrollo y aprovechamiento ético y sostenible de IA en Colombia.",
    badge: "Colombia",
  },
];

export function HomePage({
  onRegister,
  onLogin,
  onLoginAsUser,
  onLoginAsAdmin,
  onRegisterAsUser,
  onRegisterAsAdmin,
}) {
  const handleRegisterUserClick = () => {
    if (onRegisterAsUser) {
      onRegisterAsUser();
    } else {
      onRegister();
    }
  };

  const handleRegisterAdminClick = () => {
    if (onRegisterAsAdmin) {
      onRegisterAsAdmin();
    }
  };

  const handleUserClick = () => {
    if (onLoginAsUser) {
      onLoginAsUser();
    } else {
      onLogin();
    }
  };

  const handleAdminClick = () => {
    if (onLoginAsAdmin) {
      onLoginAsAdmin();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Simple */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="h-[70px] w-[260px]">
              <img alt="AI Governance Evaluator" className="h-full w-full object-contain" src={imgLogo1} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              {/* Dropdown de Registro */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#4d82bc] hover:bg-[#3d6a9c]">
                    Registrar
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleRegisterUserClick} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Usuario
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRegisterAdminClick} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Administrador
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dropdown de Inicio de Sesión */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Inicia sesión
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleUserClick} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Usuario
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Administrador
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-[42px] mb-6 text-gray-900">AI Governance Evaluator</h1>

          <p className="text-[20px] text-gray-600 mb-10 leading-relaxed">
            Aplicativo web permite a las organizaciones evaluar su nivel de madurez en gobernanza de inteligencia
            artificial y generar de forma automática una hoja de ruta personalizada para cumplir con estándares
            nacionales e internacionales
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleRegisterUserClick} size="lg" className="bg-[#4d82bc] hover:bg-[#3d6a9c]">
              Comenzar Evaluación
            </Button>
            <Button variant="outline" size="lg" onClick={handleUserClick}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="bg-[#4d82bc] py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[32px] text-white mb-3">Marcos de Referencia Integrados</h2>
            <p className="text-blue-100 text-[18px]">Principales estándares internacionales y nacionales de gobernanza de IA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {frameworks.map((framework, index) => {
              const Icon = framework.icon;
              return (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow bg-white">
                  <CardHeader className="text-center">
                    <div className="bg-[#4d82bc] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="mb-3 mx-auto bg-[#4d82bc]">{framework.badge}</Badge>
                    <CardTitle className="text-[16px] mb-2">{framework.title}</CardTitle>
                    {framework.subtitle && <p className="text-[14px] text-gray-500">{framework.subtitle}</p>}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[13px] text-center">{framework.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-gray-100 py-8 border-t">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 text-[14px]">© 2025 AI Governance Evaluator. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
