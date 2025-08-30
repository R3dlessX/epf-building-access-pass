import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	modules: ["@nuxt/ui"],
	css: ["~/assets/css/main.css"],
	devtools: { enabled: true },
	vite: {
		plugins: [tailwindcss()],
	},
	ui: {
		colorMode: false,
	},
	app: {
		head: {
			title: "Building Access Pass • EPF",
			meta: [
				{
					name: "description",
					content: "Générateur de passes d’accès dématérialisés aux bâtiments de l’EPF",
				},
				{ name: "robots", content: "index,follow" },
				{ property: "og:site_name", content: "Building Access Pass • EPF" },
				{ property: "og:type", content: "website" },
				{ property: "og:title", content: "Building Access Pass • EPF" },
				{
					property: "og:description",
					content: "Générateur de passes d’accès dématérialisés aux bâtiments de l’EPF",
				},
			],
		},
	},
});
