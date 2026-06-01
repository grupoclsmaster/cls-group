import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
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
    // 1. Validate the caller is an admin
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in.' },
        { status: 401 }
      );
    }

    // Check if the current user is an admin
    const { data: currentMember, error: memberError } = await supabase
      .from('members')
      .select('member_type')
      .eq('id', currentUser.id)
      .single();

    if (memberError || !currentMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Could not verify your permissions.' },
        { status: 403 }
      );
    }

    if (currentMember.member_type !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can create users.' },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { name, email, password, member_type, company, role } = body;

    if (!name || !email || !password || !member_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, member_type' },
        { status: 400 }
      );
    }

    if (!['master', 'mentor'].includes(member_type)) {
      return NextResponse.json(
        { error: 'member_type must be either "master" or "mentor"' },
        { status: 400 }
      );
    }

    // 3. Create auth user via admin client
    const adminClient = createAdminClient();

    const { data: newAuthUser, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError) {
      return NextResponse.json(
        { error: `Failed to create auth user: ${createUserError.message}` },
        { status: 400 }
      );
    }

    // 4. Insert into public.members
    const initials = generateInitials(name);

    const { data: newMember, error: insertError } = await adminClient
      .from('members')
      .insert({
        id: newAuthUser.user.id,
        name,
        email,
        member_type,
        initials,
        ...(company && { company }),
        ...(role && { role }),
      })
      .select()
      .single();

    if (insertError) {
      // Attempt to clean up the auth user if member insert fails
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id);

      return NextResponse.json(
        { error: `Failed to create member record: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 5. Send Welcome / Password Reset Email via Supabase
    // Isso dispara um email para o usuário pelo Supabase, servindo como email de boas-vindas
    const { error: emailError } = await adminClient.auth.resetPasswordForEmail(email);
    if (emailError) {
      console.warn("Aviso: Falha ao enviar email de boas-vindas", emailError);
    }

    return NextResponse.json(
      { message: 'User created successfully', user: newMember },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
