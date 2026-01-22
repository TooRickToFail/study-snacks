import { getSnacks } from "./api.js";
import { mapSnacks } from "./utils.js";
import { renderAllFamilies, setupFamilyAccordion, setupImageModal, setupDownloadButtons } from "./ui.js";
/*
 * This is central point for everything.
 *
*/

//---------- Imports

//---------- Main Functions
async function loadSnacks() {
	try {
		const rawSnacks = await getSnacks();
		const families = mapSnacks(rawSnacks);
		renderAllFamilies(families);
		console.log('UI-ready data:', families);
	} catch (err) {
		console.log('Failed to load families:', err);
	}
};

async function init() {
	await loadSnacks();
	setupFamilyAccordion();
	setupDownloadButtons();
};

init();