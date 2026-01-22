/*
 * Creates/exports the client connection for api.js
 *
*/

//---------- Variables
const SUPABASE_URL = 'https://jrtecgypjegwsypdhjqc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xe4ChJf8gpWZbv_T1XKrUA_e3d9gZ-t';

//---------- Exports
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client ready:', supabaseClient);




