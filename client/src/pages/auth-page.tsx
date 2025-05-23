import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Esquema de validação para login
const loginSchema = z.object({
  username: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(1, "Por favor, insira sua senha"),
  remember: z.boolean().optional().default(false),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Esquema de validação para cadastro
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["manager", "broker"]),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!isLoading && user) {
      console.log("Usuário já está logado, redirecionando para o dashboard", user);
      if (user.role === "director") {
        navigate("/director");
      } else if (user.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/broker");
      }
    }
  }, [user, isLoading, navigate]);

  // Processar o envio do login
  const handleLogin = async (values: LoginFormValues) => {
    try {
      loginMutation.mutate({
        username: values.username,
        password: values.password
      }, {
        onSuccess: (user) => {
          console.log("Login realizado com sucesso, usuário:", user);
          if (user.role === "director") {
            navigate("/director");
          } else if (user.role === "manager") {
            navigate("/manager");
          } else {
            navigate("/broker");
          }
        },
        onError: (error) => {
          console.error("Erro no login:", error);
        }
      });
    } catch (error) {
      console.error("Exceção no login:", error);
    }
  };

  // Processar o envio do cadastro
  const handleRegister = async (values: RegisterFormValues) => {
    registerMutation.mutate({
      ...values,
      avatarInitials: getInitials(values.name)
    }, {
      onSuccess: (user) => {
        if (user.role === "director") {
          navigate("/director");
        } else if (user.role === "manager") {
          navigate("/manager");
        } else {
          navigate("/broker");
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Seção do Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              BrokerBooster
            </h1>
            <p className="text-muted-foreground">
              Plataforma de gestão e gamificação para equipes imobiliárias
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm 
                    onSubmit={handleLogin} 
                    isLoading={loginMutation.isPending} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Criar uma conta</CardTitle>
                  <CardDescription>
                    Preencha seus dados para começar a usar a plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm 
                    onSubmit={handleRegister} 
                    isLoading={registerMutation.isPending} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-sm text-center text-neutral-500 mt-6">
            <p>Acessos para demonstração:</p>
            <p>Diretor: director@example.com / password</p>
            <p>Gerente: manager@example.com / password</p>
            <p>Corretor: broker@example.com / password</p>
          </div>
        </div>
      </div>

      {/* Seção de Apresentação */}
      <div className="w-full md:w-1/2 bg-primary p-8 flex items-center justify-center">
        <div className="text-white max-w-md text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">
            Potencialize o desempenho da sua equipe
          </h2>
          <p className="text-lg mb-6">
            Uma plataforma completa para gestão de atividades, negociações e desempenho
            de profissionais do mercado imobiliário.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Acompanhe o desempenho da sua equipe em tempo real</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Gerencie negociações de forma eficiente</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Organize atividades e acompanhe prazos</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Motive sua equipe com gamificação inteligente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (values: LoginFormValues) => void, isLoading: boolean }) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground"
                >
                  Lembrar-me
                </label>
              </div>
            )}
          />
          <Button variant="link" className="p-0 h-auto">
            Esqueceu a senha?
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Entrar
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (values: RegisterFormValues) => void, isLoading: boolean }) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "broker",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="broker">Corretor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Criar Conta
        </Button>
      </form>
    </Form>
  );
}