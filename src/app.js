const SUPABASE_URL = 'https://jrtecgypjegwsypdhjqc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xe4ChJf8gpWZbv_T1XKrUA_e3d9gZ-t';
const ASSET_BASE_URL = 'https://study-snacks.s3.us-east-2.amazonaws.com/textbooks';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client ready:', supabaseClient);

/* Leaving this function just to test the connection */
async function testSupabase() {
	const { data, error } = await supabaseClient
		.from('structure_family')
		.select(`
			family_id,
			family_title_main
		`);
	
	const output = document.getElementById('debug-output');
	
	if (error) {
		output.textContent = 'ERROR:\n' + JSON.stringify(error, null, 2);
		console.error(error);
		return;
	}
	
	output.textContent = JSON.stringify(data, null, 2);
}

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
}

async function getSnacks() {
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
		.order('family_title_sort', { ascending: true });
		
		//const output = document.getElementById('debug-output');
		//output.textContent = JSON.stringify(data, null, 2);
		return data;
};


function mapSnacks(rawSnacks) {
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
				release_label: release.release_label,
				release_year: release.release_year,
				release_slug: release.release_slug,
				
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

function renderDownload(snackDownload) {
	if (snackDownload.download_file_type_value = "pdf") {
		return `
<div class="shelf">
	<!-- Left: actions -->
	<div class="shelf-actions">
		<button class="shelf-btn preview-btn" data-img="${snackDownload.download_preview_url}">See Page 1</button>
		<button class="shelf-btn download-btn primary" data-key="${snackDownload.download_file_key}">Download ${snackDownload.download_file_type_label}</button>
	</div>
	<!-- Right: metadata -->
	<div class="shelf-meta">
		<div class="meta-box">
			<div class="meta-label">Produced by:</div>
			<div class="meta-value">${snackDownload.download_original_source}</div>
		</div>
		<div class="meta-box">
			<div class="meta-label">Color tone:</div>
			<div class="meta-value">${snackDownload.download_color_tone}</div>
		</div>
	</div>
</div>
		`;
	} else if (snackDownload.download_file_type_value = "epub") {
		return `
<div class="shelf">
	<!-- Left: actions -->
	<div class="shelf-actions single">
		<button class="shelf-btn download-btn primary" data-key="${snackDownload.download_file_key}">Download ${snackDownload.download_file_type_label}</button>
	</div>
	<!-- Right: metadata -->
	<div class="shelf-meta">
		<div class="meta-box">
			<div class="meta-label">Produced by:</div>
			<div class="meta-value">${snackDownload.download_original_source}</div>
		</div>
		<div class="meta-box">
			<div class="meta-label">Color tone:</div>
			<div class="meta-value">${snackDownload.download_color_tone}</div>
		</div>
	</div>
</div>

		`;
	};
};

function renderProfile(snackProfile) {
	return `
<div class="book-profile">
	<!-- Top status banner -->
	<div class="book-status ${snackProfile.profile_status_value}">${snackProfile.profile_status_label}</div>
	<div class="book-spread">
		<!-- Left page: book cover -->
		<div class="book-cover" data-img="${snackProfile.profile_cover_url}" aria-label="Click to zoom image">
			<img
				src="${snackProfile.profile_cover_url}"
				alt="Book cover"
			/>
			<span class="zoom-hint"></span>
		</div>
		<!-- Right page: info boxes -->
		<div class="book-info">
			<div class="info-box">
				<div class="label">This is a:</div>
				<div class="value">${snackProfile.profile_content}</div>
			</div>
			<div class="info-box">
				<div class="label">for:</div>
				<div class="value">${snackProfile.profile_audience}</div>
			</div>
			<div class="info-box">
				<div class="label">in:</div>
				<div class="value">${snackProfile.profile_market}</div>
			</div>
		</div>
	</div>
	<!-- Bottom downloads / shelves -->
	<div class="book-shelves">
		${snackProfile.downloads.map(renderDownload).join('')}
	</div>
</div>

	`;
};

function renderRelease(snackRelease) {
	return `
<div class="release">
	<div class="release-header">${snackRelease.release_label} (${snackRelease.release_year})</div>
	<div class="release-content">
		${snackRelease.profiles.map(renderProfile).join('')}
	</div>
</div>
	`;
};

function renderFamily(snackFamily) {
	return `
<div class="family">
	<button class="family-header">
		<div class="familyTitle">
			<div class="family-title-main">${snackFamily.family_title_main}</div>
			<div class="family-title-sub">${snackFamily.family_title_sub}</div>
		</div>
		<span class="family-authors">${snackFamily.family_author_list}</span>
	</button>
	<div class="family-content">
		${snackFamily.releases.map(renderRelease).join('')}
	</div>
</div>
	`;
};

function renderAllFamilies(families) {
	return families.map(renderFamily).join('');
};

async function loadSnacks() {
	try {
		const rawSnacks = await getSnacks();
		const families = mapSnacks(rawSnacks);
		const html = renderAllFamilies(families);
		document.getElementById('snack-list').innerHTML = html;
		console.log('UI-ready data:', families);
	} catch (err) {
		console.log('Failed to load families:', err);
	}
};

function setupFamilyAccordion() {
	document.querySelectorAll(".family-header").forEach(header => {
		header.addEventListener("click", () => {
			const content = header.nextElementSibling;
			const isOpen = content.style.display === "block";
			content.style.display = isOpen ? "none" : "block";
		});
	});
};

async function init() {
	await loadSnacks();
	setupFamilyAccordion();
	document.querySelectorAll(".download-btn").forEach(btn => {
		btn.addEventListener("click", handleDownloadClick);
	});
};

async function handleDownloadClick(event) {
	const btn = event.currentTarget;
	const fileKey = btn.dataset.key;
	
	try {
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
		window.location.href = url; // triggers the download
	} catch (err) {
		console.error(err);
		alert("Unable to download the file at this time.");
	}
};



const modal = document.getElementById("image-modal");
const modalContent = document.getElementById("image-modal-content");

function openModal(src) {
	modalContent.src = src;
	modal.classList.remove("hidden");
}

modal.addEventListener("click", () => {
	modal.classList.add("hidden");
	modalContent.src = "";
});

document.addEventListener("click", (e) => {
	const target = e.target.closest("[data-img]");
	if (!target) return;
	
	openModal(target.dataset.img);
});

init();