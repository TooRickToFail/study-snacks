document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".family-header").forEach(header => {
		header.addEventListener("click", () => {
			const content = header.nextElementSibling;
			const isOpen = content.style.display === "block";

			content.style.display = isOpen ? "none" : "block";
		});
	});
});
