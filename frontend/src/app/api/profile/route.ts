import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, grade_level, language, gender } = body;

    if (!user_id || !grade_level || !language || !gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('student_profile')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    let response;
    if (existingProfile) {
      // Update existing profile
      response = await supabase
        .from('student_profile')
        .update({
          grade_level,
          language,
          gender,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id)
        .select();
    } else {
      // Insert new profile
      response = await supabase
        .from('student_profile')
        .insert({
          user_id,
          grade_level,
          language,
          gender,
        })
        .select();
    }

    if (response.error) {
      console.error('Error saving profile:', response.error);
      return NextResponse.json(
        { success: false, error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data[0],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}