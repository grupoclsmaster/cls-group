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

// Helper to validate the caller is an admin
async function validateAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    throw new Error('Unauthorized: You must be logged in.');
  }

  const { data: currentMember, error: memberError } = await supabase
    .from('members')
    .select('member_type')
    .eq('id', currentUser.id)
    .single();

  if (memberError || !currentMember || currentMember.member_type !== 'admin') {
    throw new Error('Forbidden: Only admins can manage members.');
  }

  return { supabase, currentUser };
}

export async function PUT(request: NextRequest) {
  try {
    await validateAdmin();
    
    const body = await request.json();
    const { id, name, email, member_type, company, role } = body;

    if (!id || !name || !email || !member_type) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, email, member_type' },
        { status: 400 }
      );
    }

    if (!['admin', 'master', 'mentor'].includes(member_type)) {
      return NextResponse.json(
        { error: 'member_type must be "admin", "master" or "mentor"' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Update Auth user's email if changed
    const { data: authUser, error: getAuthError } = await adminClient.auth.admin.getUserById(id);
    if (getAuthError) {
      return NextResponse.json(
        { error: `Auth user not found: ${getAuthError.message}` },
        { status: 404 }
      );
    }

    if (authUser.user.email !== email) {
      const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(id, {
        email: email,
        email_confirm: true
      });
      if (updateAuthError) {
        return NextResponse.json(
          { error: `Failed to update auth user email: ${updateAuthError.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Update public.members
    const initials = generateInitials(name);
    const { data: updatedMember, error: updateError } = await adminClient
      .from('members')
      .update({
        name,
        email,
        member_type,
        initials,
        company: company || '',
        role: role || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update member record: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Member updated successfully', user: updatedMember },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await validateAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Delete from public.members first (just in case)
    const { error: deleteMemberError } = await adminClient
      .from('members')
      .delete()
      .eq('id', id);

    if (deleteMemberError) {
      return NextResponse.json(
        { error: `Failed to delete member record: ${deleteMemberError.message}` },
        { status: 500 }
      );
    }

    // 2. Delete Auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      return NextResponse.json(
        { error: `Failed to delete auth user: ${deleteAuthError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Member deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
