/*
 * Maps the data from api.js
 * Exports to app.js
 *
*/

//---------- Variables
const ASSET_BASE_URL = 'https://study-snacks.s3.us-east-2.amazonaws.com/textbooks';

//---------- Exports
export function mapSnacks(rawSnacks) {
	return rawSnacks.map(family => {
		const familyAuthors = ensureArray(family.m2m_author_profile).map(link => ({
			author_name: link.structure_author.author_name,
			author_ordinal: link.author_ordinal
		}))
		.sort((a, b) => a.author_ordinal - b.author_ordinal);
		
		return {
			family_id: family.family_id,
			family_title_main: family.family_title_main,
			family_title_sub: family.family_title_sub ?? "",
			family_title_sort: family.family_title_sort,
			family_slug: family.family_slug,
			family_authors: familyAuthors,
			family_author_list: familyAuthors.map(a => a.author_name).join(", "),
			
			releases: ensureArray(family.structure_release).map(release => ({
				release_id: release.release_id,
				release_year: release.release_year,
				release_label: release.lookup_edition?.edition_label ?? null,
				release_slug: release.lookup_edition?.edition_slug ?? null,
				
				profiles: ensureArray(release.structure_profile).map(profile => {
					const basePath = {
						family: family.family_slug,
						release: release.release_slug,
						profile: profile.profile_slug,
					};
					
					return {
						profile_cover_slug: profile.profile_cover_slug,
						profile_slug: profile.profile_slug,
						profile_audience: profile.lookup_audience?.audience_label ?? null,
						profile_content: profile.lookup_content?.content_label ?? null,
						profile_market: profile.lookup_market?.market_label ?? null,
						profile_status_label: profile.lookup_status?.status_label ?? null,
						profile_status_value: profile.lookup_status?.status_value ?? null,
						
						profile_cover_url: buildCoverUrl(basePath, profile.profile_cover_slug),
						
						downloads: ensureArray(profile.structure_download).map(download => ({
							download_file_slug: download.download_file_slug,
							download_file_name: download.download_file_name,
							download_preview_slug: download.download_preview_slug,
							download_file_type_label: download.lookup_file_type?.file_type_label ?? null,
							download_file_type_value: download.lookup_file_type?.file_type_value ?? null,
							download_color_tone: download.lookup_color_tone?.color_tone_label ?? null,
							download_original_source: download.lookup_original_source?.original_source_label ?? null,
							
							download_file_key: buildFileKey(basePath, download.download_file_slug),
							download_preview_url: buildPreviewUrl(basePath, download.download_preview_slug)
						}))
					};
				})
			}))
		};
	});
};

//---------- Helper Functions
function buildCoverUrl(basePath, coverSlug) {
	if (!coverSlug) return "";
	return	`${ASSET_BASE_URL}/` +
			`${basePath.family}/` +
			`${basePath.release}/` +
			`${basePath.profile}/images/` +
			coverSlug;
};

function buildFileKey(basePath, fileSlug) {
	if (!fileSlug) return "";
	return	`textbooks/` +
			`${basePath.family}/` +
			`${basePath.release}/` +
			`${basePath.profile}/files/` +
			fileSlug;
};

function buildPreviewUrl(basePath, previewSlug) {
	if (!previewSlug) return "";
	return	`${ASSET_BASE_URL}/` +
			`${basePath.family}/` +
			`${basePath.release}/` +
			`${basePath.profile}/images/` +
			previewSlug;
};

function buildAuthorList(authors) {
	console.log('authors:', authors);
	if (!authors) return [];
	const author_list = authors.map(author => author.author_name).join(", ");
	console.log('author list:', author_list);
	return author_list;
	
};

function ensureArray(snack) {
	if (!snack) return [];
	return Array.isArray(snack) ? snack : [snack];
};

