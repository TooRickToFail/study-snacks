/*
 * Renders all the HTML for the page using data from utils.js (called from app.js);
 * Attaches signed download URLs from api.js to DOM;
 * Adds accordion function for families;
 * Adds image modal function;
 *
*/

//---------- Imports
import { getDownloadUrl } from "./api.js";

//---------- Exports
export function setupDownloadButtons() {
	document.querySelectorAll(".download-btn").forEach(btn => {
		btn.addEventListener("click", handleDownloadClick);
	});
};

export function renderAllFamilies(families) {
	document.getElementById('snack-list').innerHTML = families.map(renderFamily).join('');
};

export function setupFamilyAccordion() {
	document.querySelectorAll(".family-header").forEach(header => {
		header.addEventListener("click", () => {
			const content = header.nextElementSibling;
			const isOpen = content.style.display === "block";
			content.style.display = isOpen ? "none" : "block";
		});
	});
};

export function setupImageModal() {
	const modal = document.getElementById("image-modal");
	const modalContent = document.getElementById("image-modal-content");

	function openModal(src) {
		modalContent.src = src;
		modal.classList.remove("hidden");
	};

	modal.addEventListener("click", () => {
		modal.classList.add("hidden");
		modalContent.src = "";
	});

	document.addEventListener("click", (e) => {
		const target = e.target.closest("[data-img]");
		if (!target) return;
	
		openModal(target.dataset.img);
	});
};

//---------- Helper Functions
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

function renderDownload(snackDownload) {
	if (snackDownload.download_file_type_value === "pdf") {
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
	} else if (snackDownload.download_file_type_value === "epub") {
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

async function handleDownloadClick(event) {
	const btn = event.currentTarget;
	const fileKey = btn.dataset.key;
	
	try {
		const url = await getDownloadUrl(fileKey);
		window.open(url, "_blank");
	} catch (err) {
		console.error(err);
		alert("Unable to download the file at this time.");
	}
};