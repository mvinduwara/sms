import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Radio, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/useAuth";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-[fade-in_0.5s_ease_both]">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_48px_var(--color-accent-glow)]">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">
              SMS Gateway
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
              Sign in to access your control panel
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
          <form
            onSubmit={handleSubmit((data) => login.mutate(data))}
            className="flex flex-col gap-5"
          >
            <Input
              label="Username"
              placeholder="admin"
              prefix={<User />}
              error={errors.username?.message}
              {...register("username")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              prefix={<Lock />}
              error={errors.password?.message}
              {...register("password")}
            />
            <Button
              type="submit"
              size="lg"
              loading={login.isPending}
              className="w-full mt-1"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Default credentials:{" "}
          <span className="text-[var(--color-text-secondary)] font-medium">
            admin / admin
          </span>
        </p>
      </div>
    </div>
  );
}