import { PKPass } from "passkit-generator";
import * as fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
export type EPFApplePass = {
	first_name: string | null;
	last_name: string | null;
	id: string;
	visitor: boolean;
	location: boolean;
};

export async function GenerateApplePass(data: EPFApplePass): Promise<PKPass> {

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	console.log(__dirname);

	const pass = await PKPass.from(
		{
			model: import.meta.dev ? "./server/models/passkit/epf.pass":  "./models/passkit/epf.pass",
			certificates: {
				signerCert: fs.readFileSync("./certs/cert.pem"),
				signerKey: fs.readFileSync("./certs/private.key"),
				wwdr: fs.readFileSync("./certs/AppleWWDRCAG4.pem"),
			},
		},
		{
			passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER,
			teamIdentifier: process.env.TEAM_IDENTIFIER,
			organizationName: process.env.PASS_ORGANIZATION,
			serialNumber: "EPF-" + data.id,
		},
	);

	pass.setBarcodes({
		format: "PKBarcodeFormatQR",
		message: data.id,
		altText: "ID: " + data.id,
	});

	if (!data.visitor) {
		pass.primaryFields.push(
			{
				key: "name",
				label: "lproj_name",
				value: data.last_name?.toUpperCase() + " "+ data.first_name,
			}
		);
	} else {
		pass.primaryFields.push({
			key: "visitor",
			label: "lproj_status",
			value: "Visiteur",
		});
	}

	if (data.location) {
		pass.setLocations(
			{
				longitude: 48.78904,
				latitude: 48.78904,
				relevantText: "EPF Cachan",
			},
			{
				longitude: 3.87148,
				latitude: 43.60037,
				relevantText: "EPF Montpellier",
			},
			{
				longitude: -2.2038409,
				latitude: 47.27865,
				relevantText: "EPF Saint-Nazaire",
			},
			{
				longitude: 4.06325,
				latitude: 48.26953,
				relevantText: "EPF Troyes",
			},
		);
	}
	return pass;
}
