import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().email({ message: "Deve ser um email válido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().email({ message: "Deve ser um email válido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  role: z.enum(["manager", "broker"], { 
    errorMap: () => ({ message: "Selecione um tipo de usuário" })
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if the user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        username: values.username,
        password: values.password
      });
      // Navigation will happen automatically on success
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const avatarInitials = getInitials(values.name);
      await registerMutation.mutateAsync({
        ...values,
        avatarInitials
      });
      // Navigation will happen automatically on success
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Plataforma de Performance
            </h1>
            <p className="text-muted-foreground">
              Gestão de atividades e negociações imobiliárias
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar a plataforma
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
                    Preencha os dados abaixo para se cadastrar
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
            <p>Credenciais de teste:</p>
            <p>Manager: manager@example.com / password</p>
            <p>Broker: broker@example.com / password</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-primary p-8 flex items-center justify-center">
        <div className="text-white max-w-md text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">
            Aumente a performance da sua equipe
          </h2>
          <p className="text-lg mb-6">
            Uma plataforma completa para gestão de atividades, negociações e performance
            de corretores imobiliários.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Monitore o desempenho da sua equipe</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Acompanhe negociações em tempo real</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Gerencie atividades e prazos</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Comunicação instantânea entre equipes</span>
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
              <FormLabel>Tipo de Usuário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="broker">Corretor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cadastrar
        </Button>
      </form>
    </Form>
  );
}
