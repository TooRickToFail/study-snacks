/*
 * Queries the DB using the client connection from supabaseClient.js
 * Exports the data for utils.js
 * Gets signed URL for ui.js
 *
*/

//---------- Imports
import { supabaseClient } from "./supabaseClient.js";

//---------- Exports
export async function getDownloadUrl(fileKey) {
	const res = await fetch(
		`https://jrtecgypjegwsypdhjqc.supabase.co/functions/v1/get-download-url?key=${encodeURIComponent(fileKey)}`,
		{
			headers: {
				apikey: "sb_publishable_Xe4ChJf8gpWZbv_T1XKrUA_e3d9gZ-t"
			}
		}
	);
	
	if (!res.ok) throw new Error("Failed to get download URL");
	
	const { url } = await res.json();
	return url;
};

export async function getSnacks() {
	const { data, error } = await supabaseClient
		.from('structure_family')
		.select(`
			family_id,
			family_title_main,
			family_title_sub,
			family_title_sort,
			family_slug,
			
			m2m_author_profile (
				author_ordinal,
				
				structure_author (
					author_name
				)
			),
			
			structure_release (
				release_id,
				release_label,
				release_year,
				release_slug,
				
				structure_profile (
					profile_cover_slug,
					profile_slug,
					
					lookup_audience ( audience_label ),
					lookup_content ( content_label),
					lookup_market ( market_label ),
					lookup_status ( status_label, status_value ),
					
					structure_download (
						download_file_slug,
						download_file_name,
						download_preview_slug,
						
						lookup_file_type ( file_type_label, file_type_value ),
						lookup_color_tone ( color_tone_label ),
						lookup_original_source ( original_source_label )
					)
				)
			)
		`)
		.order('family_title_sort', { ascending: true })
		.order('release_slug', { foreignTable: 'structure_release', ascending: false });
		
		return data;
};

