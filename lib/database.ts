// File: lib/database.ts
// Ready-to-use database functions for your PYQ Hub

import { supabase } from './supabase';

// ========== QUESTIONS ==========

export async function getQuestions(filters?: {
  subject?: string;
  year?: number;
  difficulty?: string;
}) {
  let query = supabase.from('questions').select('*');
  
  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function addQuestion(question: {
  title: string;
  subject: string;
  year: number;
  exam_type: string;
  question_text: string;
  answer?: string;
  difficulty: string;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('questions')
    .insert([question])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateQuestion(
  id: string,
  updates: Partial<typeof addQuestion>
) {
  const { data, error } = await supabase
    .from('questions')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ========== USERS ==========

export async function createUser(user: {
  email: string;
  username: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

// ========== FAVORITES ==========

export async function addFavorite(userId: string, questionId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, question_id: questionId }])
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function removeFavorite(userId: string, questionId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);
  
  if (error) throw error;
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('question_id')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data.map(fav => fav.question_id);
}

// ========== SYLLABI ==========

export async function getSyllabi(subject?: string) {
  let query = supabase.from('syllabi').select('*');
  
  if (subject) {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addSyllabus(syllabus: {
  name: string;
  subject: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('syllabi')
    .insert([syllabus])
    .select();
  
  if (error) throw error;
  return data[0];
}

// ========== SEARCH ==========

export async function searchQuestions(searchTerm: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,question_text.ilike.%${searchTerm}%`);
  
  if (error) throw error;
  return data;
}

// ========== ANALYTICS ==========

export async function getQuestionsBySubject() {
  const { data, error } = await supabase
    .from('questions')
    .select('subject, count')
    .rpc('questions_by_subject');
  
  if (error) throw error;
  return data;
}

export async function incrementQuestionViews(questionId: string) {
  const { error } = await supabase.rpc('increment_views', {
    question_id: questionId
  });
  
  if (error) throw error;
}