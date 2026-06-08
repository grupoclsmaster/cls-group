import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos (nome completo, e-mail e senha) são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve conter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Create the user in Auth
    const { data: newAuthUser, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      });

    if (createUserError) {
      return NextResponse.json(
        { error: `Erro ao cadastrar usuário: ${createUserError.message}` },
        { status: 400 }
      );
    }

    // 2. Insert the user profile in public.members with default type 'mentor'
    const initials = generateInitials(name);

    const { error: insertError } = await adminClient
      .from('members')
      .insert({
        id: newAuthUser.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        member_type: 'mentor', // Default Mentorado/Common Member role
        initials,
        status: 'Ativo',
      });

    if (insertError) {
      // Clean up the auth user if member profile creation fails
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id);

      return NextResponse.json(
        { error: `Erro ao criar perfil de membro: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Cadastro realizado com sucesso.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering mentee:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
